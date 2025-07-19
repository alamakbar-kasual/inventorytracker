// Simple fuzzy search implementation
export interface FuzzySearchResult<T> {
  item: T;
  score: number;
  matches: number[];
}

export function fuzzySearch<T>(
  items: T[],
  query: string,
  accessor: (item: T) => string,
  threshold: number = 0.3
): FuzzySearchResult<T>[] {
  if (!query.trim()) return items.map(item => ({ item, score: 1, matches: [] }));

  const queryLower = query.toLowerCase();
  const results: FuzzySearchResult<T>[] = [];

  for (const item of items) {
    const text = accessor(item).toLowerCase();
    const result = calculateFuzzyScore(text, queryLower);
    
    if (result.score >= threshold) {
      results.push({
        item,
        score: result.score,
        matches: result.matches
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

function calculateFuzzyScore(text: string, query: string): { score: number; matches: number[] } {
  const matches: number[] = [];
  let textIndex = 0;
  let queryIndex = 0;
  let score = 0;
  let consecutiveMatches = 0;

  while (textIndex < text.length && queryIndex < query.length) {
    const textChar = text[textIndex];
    const queryChar = query[queryIndex];

    if (textChar === queryChar) {
      matches.push(textIndex);
      consecutiveMatches++;
      score += 1 + consecutiveMatches * 0.5; // Bonus for consecutive matches
      queryIndex++;
    } else {
      consecutiveMatches = 0;
    }
    
    textIndex++;
  }

  // Penalty for unmatched query characters
  const unmatchedQueryChars = query.length - queryIndex;
  score -= unmatchedQueryChars * 2;

  // Normalize score
  const maxScore = query.length * (1 + query.length * 0.5);
  const normalizedScore = Math.max(0, score / maxScore);

  return {
    score: normalizedScore,
    matches
  };
}

export function highlightMatches(text: string, matches: number[]): string {
  if (matches.length === 0) return text;

  let result = '';
  let lastIndex = 0;

  for (const matchIndex of matches) {
    if (matchIndex >= lastIndex) {
      result += text.slice(lastIndex, matchIndex);
      result += `<mark class="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">${text[matchIndex]}</mark>`;
      lastIndex = matchIndex + 1;
    }
  }

  result += text.slice(lastIndex);
  return result;
}