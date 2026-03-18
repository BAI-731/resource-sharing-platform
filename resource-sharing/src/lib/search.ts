import { Resource } from '@/types';

export interface SearchResult {
  resource: Resource;
  score: number;
  matches: {
    field: string;
    value: string;
  }[];
}

export function searchResources(
  resources: Resource[],
  query: string,
  options?: {
    category?: string;
    maxPrice?: number;
    minPrice?: number;
    location?: string;
  }
): SearchResult[] {
  if (!query.trim() && !options) {
    return resources.map((r) => ({ resource: r, score: 0, matches: [] }));
  }

  const normalizedQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  for (const resource of resources) {
    let currentScore = 0;
    const matches: { field: string; value: string }[] = [];

    if (options?.category && resource.category !== options.category) {
      continue;
    }

    if (options?.minPrice !== undefined && resource.price < options.minPrice) {
      continue;
    }
    if (options?.maxPrice !== undefined && resource.price > options.maxPrice) {
      continue;
    }

    if (options?.location && !resource.location.toLowerCase().includes(options.location.toLowerCase())) {
      continue;
    }

    if (normalizedQuery) {
      if (resource.title.toLowerCase().includes(normalizedQuery)) {
        currentScore = currentScore + 100;
        matches.push({ field: '标题', value: resource.title });
      }

      if (resource.description.toLowerCase().includes(normalizedQuery)) {
        currentScore = currentScore + 50;
        matches.push({ field: '描述', value: resource.description.substring(0, 50) });
      }

      if (resource.category.toLowerCase().includes(normalizedQuery)) {
        currentScore = currentScore + 30;
        matches.push({ field: '类别', value: resource.category });
      }

      if (resource.location.toLowerCase().includes(normalizedQuery)) {
        currentScore = currentScore + 25;
        matches.push({ field: '位置', value: resource.location });
      }

      if (resource.tags) {
        for (const tag of resource.tags) {
          if (tag.toLowerCase().includes(normalizedQuery)) {
            currentScore = currentScore + 20;
            matches.push({ field: '标签', value: tag });
          }
        }
      }

      if (resource.title.toLowerCase() === normalizedQuery) {
        currentScore = currentScore + 200;
      }

      if (resource.title.toLowerCase().startsWith(normalizedQuery)) {
        currentScore = currentScore + 50;
      }
    }

    if (resource.rating) {
      currentScore = currentScore + resource.rating * 5;
    }

    if (resource.views > 0) {
      currentScore = currentScore + Math.min(resource.views / 10, 20);
    }

    if (currentScore > 0 || !normalizedQuery) {
      results.push({ resource, score: currentScore, matches });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

export function getSearchSuggestions(resources: Resource[], query: string, limit = 5): string[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  const suggestions = new Set<string>();

  for (const resource of resources) {
    if (resource.title.toLowerCase().includes(normalizedQuery)) {
      suggestions.add(resource.title);
    }

    if (resource.category.toLowerCase().includes(normalizedQuery)) {
      suggestions.add(resource.category);
    }

    if (resource.tags) {
      for (const tag of resource.tags) {
        if (tag.toLowerCase().includes(normalizedQuery)) {
          suggestions.add(tag);
        }
      }
    }

    if (suggestions.size >= limit) break;
  }

  return Array.from(suggestions).slice(0, limit);
}
