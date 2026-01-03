import dotenv from 'dotenv';
import type { NewsSource } from '../types/index.js';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  claudeApiKey: process.env.CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY || '',
  positivityThreshold: parseFloat(process.env.POSITIVITY_THRESHOLD || '0.7'),
  fetchIntervalCron: '0 * * * *', // Every hour
};

export const sources: NewsSource[] = [
  {
    name: 'Optimist Daily',
    url: 'https://www.optimistdaily.com/feed/',
    type: 'rss',
  },
  {
    name: 'Good News Network',
    url: 'https://www.goodnewsnetwork.org/feed/',
    type: 'rss',
  },
  {
    name: 'Positive News',
    url: 'https://www.positive.news/feed/',
    type: 'rss',
  },
  {
    name: 'Sunny Skyz',
    url: 'https://feeds.feedburner.com/SunnySkyz',
    type: 'rss',
  },
  {
    name: 'Upworthy',
    url: 'https://www.upworthy.com/feeds/feed.rss',
    type: 'rss',
  },
  {
    name: 'Reasons to be Cheerful',
    url: 'https://reasonstobecheerful.world/feed/',
    type: 'rss',
  },
  {
    name: 'Good News EU',
    url: 'https://goodnews.eu/feed/',
    type: 'rss',
  },
  {
    name: 'The Better India',
    url: 'https://www.thebetterindia.com/feed/',
    type: 'rss',
  },
  {
    name: 'Good Good Good',
    url: 'https://www.goodgoodgood.co/articles/rss.xml',
    type: 'rss',
  },
  {
    name: 'Quanta Magazine',
    url: 'https://www.quantamagazine.org/feed/',
    type: 'rss',
  },
];

export function validateConfig(): void {
  if (!config.claudeApiKey) {
    console.warn('Warning: CLAUDE_API_KEY not set. Sentiment analysis will fail.');
  }
}
