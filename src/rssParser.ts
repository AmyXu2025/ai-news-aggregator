import axios from 'axios';
import { parseString } from 'xml2js';
import { promisify } from 'util';
import { RssSource, ParsedItem } from './types.js';

const parseXml = promisify(parseString);

export async function parseRss(url: string, sourceName: string): Promise<ParsedItem[]> {
  const response = await axios.get(url, {
    timeout: 10000,
    headers: {
      'User-Agent': 'AI-News-Aggregator/1.0'
    }
  });

  const result = await parseXml(response.data as string);
  const items: ParsedItem[] = [];

  if (result.rss && result.rss.channel && result.rss.channel[0].item) {
    const rssItems = result.rss.channel[0].item;
    for (const item of rssItems) {
      items.push({
        title: item.title ? item.title[0] : '无标题',
        link: item.link ? item.link[0] : '',
        pubDate: item.pubDate ? item.pubDate[0] : new Date().toISOString(),
        description: extractDescription(item.description ? item.description[0] : '', sourceName)
      });
    }
  } else if (result.feed) {
    const atomItems = result.feed.entry || [];
    for (const item of atomItems) {
      const link = item.link ? (Array.isArray(item.link[0]) ? item.link[0].$.href : item.link[0]) : '';
      items.push({
        title: item.title ? item.title[0] : '无标题',
        link: link,
        pubDate: item.published ? item.published[0] : item.updated ? item.updated[0] : new Date().toISOString(),
        description: extractDescription(item.summary ? item.summary[0] : item.content ? item.content[0] : '', sourceName)
      });
    }
  }

  return items;
}

function isUrlOnlyText(text: string): boolean {
  const urlPattern = /^https?:\/\//i;
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  if (lines.length <= 2 && lines.every(line => urlPattern.test(line))) {
    return true;
  }
  const words = text.replace(/https?:\/\/[^\s]*/g, '').replace(/\s+/g, '').trim();
  return words.length < 10;
}

function extractDescription(html: string, sourceName: string): string {
  if (!html) return '';

  let text = html.replace(/<[^>]*>/g, ' ').trim();
  text = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&nbsp;/g, ' ');
  text = text.replace(/\s+/g, ' ').trim();

  text = text.replace(/文章网址[：:]\s*/gi, '').replace(/评论网址[：:]\s*/gi, '').replace(/积分[：:]\s*\d+/gi, '').replace(/#评论[：:]\s*\d+/gi, '');
  text = text.replace(/Article URL[：:]\s*/gi, '').replace(/Comments URL[：:]\s*/gi, '').replace(/Points[：:]\s*\d+/gi, '').replace(/# Comments[：:]\s*\d+/gi, '');
  text = text.replace(/\s+/g, ' ').trim();

  if (isUrlOnlyText(text)) {
    return '';
  }

  if (text.length > 100) {
    return text.substring(0, 100) + '...';
  }
  return text;
}