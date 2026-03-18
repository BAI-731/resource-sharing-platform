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
    let score = 0;
    const matches: { field: string; value: string }[] = [];

    // 分类筛选
    if (options?.category && resource.category !== options.category) {
      continue;
    }

    // 价格筛选
    if (options?.minPrice !== undefined && resource.price < options.minPrice) {
      continue;
    }
    if (options?.maxPrice !== undefined && resource.price > options.maxPrice) {
      continue;
    }

    // 位置筛选
    if (options?.location && !resource.location.toLowerCase().includes(options.location.toLowerCase())) {
      continue;
    }

    // 文本搜索
    if (normalizedQuery) {
      // 标题匹配（最高权重）
      if (resource.title.toLowerCase().includes(normalizedQuery)) {
        score += 100;
        matches.push({ field: '标题', value: resource.title });
      }

      // 描述匹配
      if (resource.description.toLowerCase().includes(normalizedQuery)) {
        score += 50;
        matches.push({ field: '描述', value: resource.description.substring(0, 50) });
      }

      // 类别匹配
      if (resource.category.toLowerCase().includes(normalizedQuery)) {
        score += 30;
        matches.push({ field: '类别', value: resource.category });
      }

      // 位置匹配
      if (resource.location.toLowerCase().includes(normalizedQuery)) {
        score += 25;
        matches.push({ field: '位置', value: resource.location });
      }

      // 标签匹配
      if (resource.tags) {
        for (const tag of resource.tags) {
          if (tag.toLowerCase().includes(normalizedQuery)) {
            score += 20;
            matches.push({ field: '标签', value: tag });
          }
        }
      }

      // 完全匹配（额外加分）
      if (resource.title.toLowerCase() === normalizedQuery) {
        score += 200;
      }

      // 前缀匹配（额外加分）
      if (resource.title.toLowerCase().startsWith(normalizedQuery)) {
        score += 50;
      }
    }

    // 评分和浏览量加分
    if (resource.rating) {
      score = score + resource.rating * 5;
    }
    if (resource.views > 0) {
      score = score + Math.min(resource.views / 10, 20);
    }

    if (score > 0 || !normalizedQuery) {
      results.push({ resource, score, matches });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

export function highlightMatches(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (regex.test(part)) {
      return <mark key={index} className="bg-yellow-200 text-yellow-800 px-1 rounded">{part}</mark>;
    }
    return part;
  });
}

export function getSearchSuggestions(resources: Resource[], query: string, limit = 5): string[] {
  const normalizedQuery = query.toLowerCase().trim();
  if (!normalizedQuery) return [];

  const suggestions = new Set<string>();

  for (const resource of resources) {
    // 标题建议
    if (resource.title.toLowerCase().includes(normalizedQuery)) {
      suggestions.add(resource.title);
    }

    // 类别建议
    if (resource.category.toLowerCase().includes(normalizedQuery)) {
      suggestions.add(resource.category);
    }

    // 标签建议
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
