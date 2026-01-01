export interface Article {
  id?: number;
  title: string;
  description: string;
  content?: string;
  url: string;
  source: string;
  publishedAt: string;
  fetchedAt: string;
  positivityScore: number;
  imageUrl?: string;
}

export interface NewsSource {
  name: string;
  url: string;
  type: 'rss' | 'scrape';
}

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SentimentResult {
  score: number;
  isPositive: boolean;
}
