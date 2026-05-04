import { RssSource, NewsItem } from './types.js';
import { parseRss } from './rssParser.js';

const RSS_SOURCES: RssSource[] = [
  {
    name: 'TechCrunch AI',
    url: 'https://techcrunch.com/category/artificial-intelligence/feed/'
  },
  {
    name: 'Hacker News AI',
    url: 'https://hnrss.org/newest?q=AI&count=30'
  },
  {
    name: '量子位',
    url: 'https://www.qbitai.com/feed'
  }
];

export async function fetchAllNews(): Promise<{ news: NewsItem[]; sourceCount: number }> {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  console.log(`\n[时间过滤] 只保留 ${new Date(oneDayAgo).toLocaleString()} 之后的新闻\n`);

  const allNews: NewsItem[] = [];
  let totalFetched = 0;
  let totalFiltered = 0;

  for (const source of RSS_SOURCES) {
    try {
      console.log(`[抓取中] ${source.name}...`);
      const items = await parseRss(source.url, source.name);
      const beforeFilter = items.length;
      totalFetched += beforeFilter;

      const newsItems: NewsItem[] = [];
      for (const item of items) {
        const pubDate = new Date(item.pubDate);
        if (!isNaN(pubDate.getTime()) && pubDate.getTime() >= oneDayAgo) {
          newsItems.push({
            title: item.title,
            link: item.link,
            pubDate: pubDate,
            source: source.name,
            description: item.description
          });
        }
      }

      const afterFilter = newsItems.length;
      totalFiltered += (beforeFilter - afterFilter);

      console.log(`  -> 获取 ${beforeFilter} 条, 24小时内 ${afterFilter} 条`);

      allNews.push(...newsItems);
    } catch (error) {
      console.error(`  -> 获取失败:`, error instanceof Error ? error.message : error);
    }
  }

  allNews.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  const successfulSources = new Set(allNews.map(item => item.source));

  console.log(`\n[汇总] 共抓取 ${totalFetched} 条, 过滤掉 ${totalFiltered} 条, 最终 ${allNews.length} 条\n`);

  return {
    news: allNews,
    sourceCount: successfulSources.size
  };
}