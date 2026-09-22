import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const feeds = [
  ['SBS', 'https://news.sbs.co.kr/news/SectionRssFeed.do?sectionId=01&plink=RSSREADER'],
  ['뉴시스', 'https://nwww.newsis.com/RSS/sokbo.xml'],
  ['동아일보', 'https://rss.donga.com/total.xml'],
  ['경향신문', 'https://www.khan.co.kr/rss/rssdata/total_news.xml'],
  ['매일경제', 'https://www.mk.co.kr/rss/40300001/'],
  ['한국경제', 'https://www.hankyung.com/feed/all-news'],
  ['MBN', 'https://www.mbn.co.kr/rss/'],
  ['조선일보', 'https://www.chosun.com/arc/outboundfeeds/rss/?outputType=xml'],
  ['연합뉴스', 'https://www.yna.co.kr/rss/news.xml'],
];

const scriptDir = dirname(fileURLToPath(import.meta.url));
const outputDir = resolve(scriptDir, '../inspection');

function decodeEntities(value = '') {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapePattern(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function firstTag(xml, names) {
  for (const name of names) {
    const escaped = escapePattern(name);
    const match = xml.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, 'i'));
    if (match) return decodeEntities(match[1]);
  }
  return '';
}

function directChildNames(xml) {
  const withoutNested = xml.replace(/<([\w:-]+)(?:\s[^>]*)?>[\s\S]*?<\/\1>/g, (match) => match);
  const names = [];
  const regex = /<([\w:-]+)(?:\s[^>]*)?>/g;
  let match;
  while ((match = regex.exec(withoutNested))) {
    const name = match[1];
    if (!names.includes(name)) names.push(name);
  }
  return names;
}

function findItems(xml) {
  const rssItems = [...xml.matchAll(/<item(?:\s[^>]*)?>([\s\S]*?)<\/item>/gi)];
  if (rssItems.length) return { format: 'RSS', items: rssItems.map((match) => match[1]) };
  const atomItems = [...xml.matchAll(/<entry(?:\s[^>]*)?>([\s\S]*?)<\/entry>/gi)];
  return { format: atomItems.length ? 'Atom' : '알 수 없음', items: atomItems.map((match) => match[1]) };
}

function getLink(item) {
  const textLink = firstTag(item, ['link']);
  if (textLink) return textLink;
  const href = item.match(/<link[^>]+href=["']([^"']+)["'][^>]*\/?\s*>/i);
  return href ? decodeEntities(href[1]) : '';
}

function csvCell(value) {
  const text = String(value ?? '').replace(/\r?\n/g, ' ');
  return `"${text.replace(/"/g, '""')}"`;
}

function shorten(value, length = 180) {
  return value.length > length ? `${value.slice(0, length - 1)}…` : value;
}

async function inspectFeed([publisher, requestedUrl]) {
  const startedAt = performance.now();
  try {
    const response = await fetch(requestedUrl, {
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; NewsLens RSS Inspector/0.1)',
        accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(20_000),
    });
    const bytes = new Uint8Array(await response.arrayBuffer());
    const headerType = response.headers.get('content-type') ?? '';
    const declaredEncoding = `${headerType} ${new TextDecoder('ascii').decode(bytes.slice(0, 200))}`;
    const encoding = /euc[-_]?kr|ks_c_5601-1987/i.test(declaredEncoding) ? 'euc-kr' : 'utf-8';
    const xml = new TextDecoder(encoding).decode(bytes).replace(/^\uFEFF/, '');
    const parsed = findItems(xml);
    const firstItem = parsed.items[0] ?? '';
    const fields = directChildNames(firstItem);
    return {
      publisher,
      requestedUrl,
      finalUrl: response.url,
      ok: response.ok && parsed.items.length > 0,
      httpStatus: response.status,
      contentType: headerType,
      encoding,
      format: parsed.format,
      itemCount: parsed.items.length,
      fields: fields.join(' | '),
      title: firstTag(firstItem, ['title']),
      publishedAt: firstTag(firstItem, ['pubDate', 'published', 'updated', 'dc:date']),
      link: getLink(firstItem),
      description: firstTag(firstItem, ['description', 'summary', 'content:encoded', 'content']),
      byteLength: bytes.byteLength,
      elapsedMs: Math.round(performance.now() - startedAt),
      error: response.ok ? (parsed.items.length ? '' : '기사 item/entry를 찾지 못함') : `HTTP ${response.status}`,
      firstItemRaw: firstItem ? `<${parsed.format === 'Atom' ? 'entry' : 'item'}>${firstItem}</${parsed.format === 'Atom' ? 'entry' : 'item'}>` : xml.slice(0, 3000),
    };
  } catch (error) {
    return {
      publisher,
      requestedUrl,
      finalUrl: '',
      ok: false,
      httpStatus: '',
      contentType: '',
      encoding: '',
      format: '',
      itemCount: 0,
      fields: '',
      title: '',
      publishedAt: '',
      link: '',
      description: '',
      byteLength: 0,
      elapsedMs: Math.round(performance.now() - startedAt),
      error: error instanceof Error ? error.message : String(error),
      firstItemRaw: '',
    };
  }
}

await mkdir(outputDir, { recursive: true });
const inspectedAt = new Date().toISOString();
const results = await Promise.all(feeds.map(inspectFeed));
const columns = [
  '언론사', '성공', 'HTTP 상태', '요청 URL', '최종 URL', 'Content-Type', '인코딩', '형식',
  '기사 수', '첫 기사 필드', '첫 기사 제목', '첫 기사 발행시각', '첫 기사 링크',
  '첫 기사 설명', '응답 바이트', '응답 시간(ms)', '오류',
];
const csvRows = results.map((result) => [
  result.publisher,
  result.ok ? '성공' : '실패',
  result.httpStatus,
  result.requestedUrl,
  result.finalUrl,
  result.contentType,
  result.encoding,
  result.format,
  result.itemCount,
  result.fields,
  result.title,
  result.publishedAt,
  result.link,
  result.description,
  result.byteLength,
  result.elapsedMs,
  result.error,
].map(csvCell).join(','));
const csv = `\uFEFF${columns.map(csvCell).join(',')}\n${csvRows.join('\n')}\n`;

const txt = [
  'NewsLens RSS 수신 구조 확인',
  `확인 시각: ${inspectedAt}`,
  `대상: ${results.length}개 언론사`,
  '',
  ...results.flatMap((result) => [
    '='.repeat(80),
    `[${result.publisher}] ${result.ok ? '성공' : '실패'}`,
    `요청 URL: ${result.requestedUrl}`,
    `최종 URL: ${result.finalUrl || '-'}`,
    `HTTP: ${result.httpStatus || '-'} / Content-Type: ${result.contentType || '-'}`,
    `인코딩: ${result.encoding || '-'} / 형식: ${result.format || '-'} / 기사 수: ${result.itemCount}`,
    `필드: ${result.fields || '-'}`,
    `첫 제목: ${result.title || '-'}`,
    `발행 시각: ${result.publishedAt || '-'}`,
    `링크: ${result.link || '-'}`,
    `설명: ${shorten(result.description || '-')}`,
    `오류: ${result.error || '-'}`,
    '',
    '첫 기사 XML 원문:',
    result.firstItemRaw || '(없음)',
    '',
  ]),
].join('\n');

await Promise.all([
  writeFile(resolve(outputDir, 'rss-structure.csv'), csv, 'utf8'),
  writeFile(resolve(outputDir, 'rss-samples.txt'), txt, 'utf8'),
]);

for (const result of results) {
  console.log(`${result.ok ? 'OK' : 'FAIL'}\t${result.publisher}\tHTTP ${result.httpStatus || '-'}\t${result.itemCount}개\t${result.error}`);
}
console.log(`CSV: ${resolve(outputDir, 'rss-structure.csv')}`);
console.log(`TXT: ${resolve(outputDir, 'rss-samples.txt')}`);
