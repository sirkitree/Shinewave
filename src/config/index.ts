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
];

export function validateConfig(): void {
  if (!config.claudeApiKey) {
    console.warn('Warning: CLAUDE_API_KEY not set. Sentiment analysis will fail.');
  }
}
