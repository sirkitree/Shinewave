import Anthropic from '@anthropic-ai/sdk';
import { config } from '../../config/index.js';
import type { SentimentResult } from '../../types/index.js';

const anthropic = new Anthropic({
  apiKey: config.claudeApiKey,
});

export async function analyzePositivity(title: string, description: string): Promise<SentimentResult> {
  if (!config.claudeApiKey) {
    throw new Error('Claude API key not configured');
  }

  const cleanDesc = (description || 'No description').slice(0, 300);

  const prompt = `Rate this news article's positivity from 0 to 1. Respond with ONLY a JSON object like {"score": 0.85}

Title: ${title}
Description: ${cleanDesc}

JSON only:`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 50,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      return { score: 0.5, isPositive: false };
    }

    const text = content.text;

    // Extract JSON from response
    const jsonMatch = text.match(/\{[^}]*"score"\s*:\s*[\d.]+[^}]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const score = Math.max(0, Math.min(1, parsed.score));

      return {
        score,
        isPositive: score >= config.positivityThreshold,
      };
    }

    // Try to find just a number
    const numberMatch = text.match(/\b(0\.\d+|1\.0*|0|1)\b/);
    if (numberMatch) {
      const score = parseFloat(numberMatch[0]);
      return {
        score,
        isPositive: score >= config.positivityThreshold,
      };
    }

    console.error('Could not parse sentiment from:', text);
    return { score: 0.5, isPositive: false };
  } catch (error) {
    console.error('Claude API error:', error);
    return { score: 0.5, isPositive: false };
  }
}
