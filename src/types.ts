export interface NewsItem {
  title: string;
  link: string;
  pubDate: Date;
  source: string;
  description: string;
  translatedTitle?: string;
  translatedDescription?: string;
}

export interface RssSource {
  name: string;
  url: string;
}

export interface ParsedItem {
  title: string;
  link: string;
  pubDate: string;
  description: string;
}