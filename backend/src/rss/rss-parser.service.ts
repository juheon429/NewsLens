import { Injectable } from '@nestjs/common';
import { XMLParser } from 'fast-xml-parser';

import { classifyCategory } from './category-classifier';
import { createDedupKey } from './dedup-key';
import { normalizeDescription } from './description-normalizer';
import { ParsedRssArticle, RssSource } from './rss.types';
import { canonicalizeUrl } from './url-normalizer';

type XmlValue = string | number | null | XmlValue[] | Record<string, unknown>;

@Injectable()
export class RssParserService {
  private readonly parser = new XMLParser({
    attributeNamePrefix: '@_',
    ignoreAttributes: false,
    parseTagValue: false,
    processEntities: true,
    trimValues: false,
  });

  parse(source: RssSource, xml: string): ParsedRssArticle[] {
    const parsed = this.parser.parse(xml) as Record<string, unknown>;
    const rss = this.asRecord(parsed.rss);
    const channel = this.asRecord(rss.channel);
    const items = this.asArray(channel.item);

    return items.flatMap((rawItem) => {
      const item = this.asRecord(rawItem);
      const title = this.readText(item.title).trim();
      const url = this.readText(item.link).trim();
      if (!title || !url) return [];

      let canonicalUrl: string;
      try {
        canonicalUrl = canonicalizeUrl(url);
      } catch {
        return [];
      }

      const guid = this.readText(item.guid).trim() || null;
      const rawDescription = this.readText(item.description).trim() || null;
      const cleanDescription = normalizeDescription(rawDescription);
      const categories = this.asArray(item.category)
        .map((category) => this.readText(category).trim())
        .filter(Boolean);
      const publishedValue =
        this.readText(item.pubDate) ||
        this.readText(item['dc:date']) ||
        this.readText(item.published) ||
        this.readText(item.updated);
      const publishedAt = new Date(publishedValue);
      const validPublishedAt = Number.isNaN(publishedAt.getTime()) ? new Date() : publishedAt;
      const imageUrl = this.readImageUrl(item, rawDescription);
      const category = classifyCategory({
        categories,
        title,
        description: cleanDescription,
        url: canonicalUrl,
      });

      return [
        {
          publisher: source.publisher,
          guid,
          url,
          canonicalUrl,
          title,
          rawDescription,
          cleanDescription,
          imageUrl,
          category,
          publishedAt: validPublishedAt,
          dedupKey: createDedupKey(source.publisher, guid, canonicalUrl),
        },
      ];
    });
  }

  private readImageUrl(item: Record<string, unknown>, description: string | null) {
    const candidates = [
      ...this.asArray(item.enclosure),
      ...this.asArray(item['media:content']),
      ...this.asArray(item['media:thumbnail']),
    ];

    for (const candidate of candidates) {
      const record = this.asRecord(candidate);
      const url = this.readText(record['@_url']).trim();
      if (url) return url;
    }

    const match = description?.match(/<img[^>]+src=["']([^"']+)["']/i);
    return match?.[1]?.replace(/&amp;/g, '&') ?? null;
  }

  private readText(value: unknown): string {
    if (typeof value === 'string' || typeof value === 'number') return String(value);
    if (Array.isArray(value)) return value.map((item) => this.readText(item)).join(' ');
    const record = this.asRecord(value);
    return this.readText(record['#text'] ?? record['__cdata'] ?? '');
  }

  private asRecord(value: unknown): Record<string, XmlValue> {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, XmlValue>;
    }
    return {};
  }

  private asArray(value: unknown): XmlValue[] {
    if (value === undefined || value === null) return [];
    return Array.isArray(value) ? (value as XmlValue[]) : [value as XmlValue];
  }
}
