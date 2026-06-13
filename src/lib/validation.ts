import { 
  RegExpMatcher, 
  englishDataset, 
  englishRecommendedTransformers 
} from 'obscenity';

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

/**
 * Normalizes text: trims, collapses internal spaces, and checks for profanity.
 * Returns the normalized text if clean, or throws an error if profane.
 */
export function validateAndNormalize(text: string, label: string): string {
  const normalized = text.trim().replace(/\s+/g, ' ');
  
  if (!normalized) {
    throw new Error(`${label} cannot be empty.`);
  }

  if (matcher.hasMatch(normalized)) {
    throw new Error(`${label} contains inappropriate language.`);
  }

  return normalized;
}

export function generateRecipientKey(name: string): string {
  return name.toLowerCase().trim().replace(/\s+/g, ' ');
}
