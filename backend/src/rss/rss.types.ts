import { NewsCategory } from '@prisma/client';

export interface RssSource {
  publisher: string;
  url: string;
}

export interface ParsedRssArticle {
  publisher: string;
  guid: string | null;
  url: string;
  canonicalUrl: string;
  title: string;
  rawDescription: string | null;
  cleanDescription: string | null;
  imageUrl: string | null;
  category: NewsCategory;
  publishedAt: Date;
  dedupKey: string;
}
