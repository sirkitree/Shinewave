import { franc } from 'franc';

/**
 * Detects the language of the given text.
 * Returns ISO 639-3 language code (e.g., 'eng' for English, 'deu' for German)
 * Returns 'und' if the language cannot be determined.
 */
export function detectLanguage(text: string): string {
  if (!text || text.length < 10) {
    return 'und';
  }
  return franc(text);
}

// Languages that are acceptable (English and closely related)
// 'eng' = English, 'sco' = Scots (often misidentified for English)
const ENGLISH_LIKE_LANGUAGES = new Set(['eng', 'sco']);

/**
 * Checks if the text is in English (or a closely related language like Scots).
 * Combines title and description for better detection accuracy.
 */
export function isEnglish(title: string, description: string): boolean {
  // Combine title and description for better detection
  const combinedText = `${title} ${description}`.trim();

  if (combinedText.length < 20) {
    // Too short to reliably detect, assume English
    return true;
  }

  const language = detectLanguage(combinedText);

  // 'und' means undetermined - give benefit of the doubt
  if (language === 'und') {
    return true;
  }

  return ENGLISH_LIKE_LANGUAGES.has(language);
}
