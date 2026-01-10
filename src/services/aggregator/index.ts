import Parser from 'rss-parser';
import { sources } from '../../config/index.js';
import { insertArticle, articleExists, urlWasRejected, insertRejectedUrl } from '../../db/index.js';
import { analyzePositivity } from '../sentiment/index.js';
import { isEnglish } from '../language/index.js';
import type { Article, NewsSource } from '../../types/index.js';

// Configure parser to include content:encoded
const parser = new Parser({
  customFields: {
    item: [
      ['content:encoded', 'contentEncoded'],
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
    ],
  },
});

// Extract first image URL from HTML content
function extractImageFromHtml(html: string | undefined): string | undefined {
  if (!html) return undefined;

  // Match img src
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch) return imgMatch[1];

  return undefined;
}

// Extract og:image or twitter:image from HTML
function extractOgImage(html: string): string | undefined {
  // Try og:image first
  const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
  if (ogMatch) return ogMatch[1];

  // Try alternate og:image format
  const ogMatch2 = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (ogMatch2) return ogMatch2[1];

  // Try twitter:image
  const twitterMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
  if (twitterMatch) return twitterMatch[1];

  // Try twitter:image alternate format
  const twitterMatch2 = html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
  if (twitterMatch2) return twitterMatch2[1];

  return undefined;
}

// Scrape image from article page
async function scrapeImageFromPage(url: string): Promise<string | undefined> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Shinewave/1.0 (Positive News Aggregator)',
      },
    });

    clearTimeout(timeout);

    if (!response.ok) return undefined;

    const html = await response.text();

    // Try og:image first (most reliable for featured images)
    const ogImage = extractOgImage(html);
    if (ogImage) return ogImage;

    // Fall back to first image in article
    return extractImageFromHtml(html);
  } catch (error) {
    // Silently fail - image scraping is best-effort
    return undefined;
  }
}

// Extract image from various RSS fields
function extractImageUrl(item: Record<string, unknown>): string | undefined {
  // Check enclosure (standard RSS)
  const enclosure = item.enclosure as { url?: string } | undefined;
  if (enclosure?.url) return enclosure.url;

  // Check media:content
  const mediaContent = item.mediaContent as { $?: { url?: string } } | undefined;
  if (mediaContent?.$?.url) return mediaContent.$.url;

  // Check media:thumbnail
  const mediaThumbnail = item.mediaThumbnail as { $?: { url?: string } } | undefined;
  if (mediaThumbnail?.$?.url) return mediaThumbnail.$.url;

  // Extract from content:encoded (WordPress sites embed images here)
  const contentEncoded = item.contentEncoded as string | undefined;
  const fromEncoded = extractImageFromHtml(contentEncoded);
  if (fromEncoded) return fromEncoded;

  // Extract from regular content
  const content = item.content as string | undefined;
  const fromContent = extractImageFromHtml(content);
  if (fromContent) return fromContent;

  // Extract from description
  const description = item.description as string | undefined;
  return extractImageFromHtml(description);
}

async function fetchFromRSS(source: NewsSource): Promise<Partial<Article>[]> {
  try {
    const feed = await parser.parseURL(source.url);

    return feed.items.map((item) => {
      const rawItem = item as Record<string, unknown>;

      return {
        title: item.title || 'Untitled',
        description: item.contentSnippet || item.content || '',
        content: (rawItem.contentEncoded as string) || item.content,
        url: item.link || '',
        source: source.name,
        publishedAt: item.pubDate || new Date().toISOString(),
        imageUrl: extractImageUrl(rawItem),
      };
    });
  } catch (error) {
    console.error(`Error fetching from ${source.name}:`, error);
    return [];
  }
}

export async function fetchAllSources(maxArticles?: number): Promise<{
  processed: number;
  added: number;
  skipped: number;
}> {
  let processed = 0;
  let added = 0;
  let skipped = 0;
  let totalProcessed = 0;

  for (const source of sources) {
    if (maxArticles && totalProcessed >= maxArticles) break;

    console.log(`Fetching from ${source.name}...`);

    const articles = await fetchFromRSS(source);

    for (const article of articles) {
      if (maxArticles && totalProcessed >= maxArticles) break;

      processed++;
      totalProcessed++;

      if (!article.url || articleExists(article.url) || urlWasRejected(article.url)) {
        skipped++;
        continue;
      }

      // Check if article is in English before scoring
      if (!isEnglish(article.title || '', article.description || '')) {
        console.log(`  Skipped (non-English): ${article.title}`);
        insertRejectedUrl(article.url, source.name, -1); // -1 indicates language rejection
        skipped++;
        continue;
      }

      try {
        const sentiment = await analyzePositivity(
          article.title || '',
          article.description || ''
        );

        if (sentiment.isPositive) {
          // If no image from RSS, scrape from article page
          let imageUrl = article.imageUrl;
          if (!imageUrl && article.url) {
            console.log(`    Scraping image for: ${article.title?.slice(0, 50)}...`);
            imageUrl = await scrapeImageFromPage(article.url);
          }

          const fullArticle: Article = {
            title: article.title || 'Untitled',
            description: article.description || '',
            content: article.content,
            url: article.url,
            source: article.source || source.name,
            publishedAt: article.publishedAt || new Date().toISOString(),
            fetchedAt: new Date().toISOString(),
            positivityScore: sentiment.score,
            imageUrl: imageUrl,
          };

          const wasInserted = insertArticle(fullArticle);
          if (wasInserted) {
            added++;
            console.log(`  Added: ${article.title} (score: ${sentiment.score.toFixed(2)})`);
          }
        } else {
          console.log(`  Skipped (low score ${sentiment.score.toFixed(2)}): ${article.title}`);
          insertRejectedUrl(article.url, source.name, sentiment.score);
          skipped++;
        }
      } catch (error) {
        console.error(`  Error processing article: ${article.title}`, error);
        skipped++;
      }
    }
  }

  console.log(`Fetch complete: ${processed} processed, ${added} added, ${skipped} skipped`);
  return { processed, added, skipped };
}
