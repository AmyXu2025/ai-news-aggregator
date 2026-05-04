import { fetchAllNews } from './newsFetcher.js';
import { generateMarkdown, saveMarkdown, getTodayDateString } from './utils.js';
import { translateNewsItem } from './translator.js';
import { NewsItem } from './types.js';

async function main() {
  console.log('开始抓取 AI 新闻...\n');

  try {
    const { news, sourceCount } = await fetchAllNews();

    if (news.length === 0) {
      console.log('未找到最近24小时内的新闻文章。');
      return;
    }

    console.log(`开始翻译 ${news.length} 篇文章...`);
    const translatedNews: NewsItem[] = await Promise.all(
      news.map(async (item) => {
        const { translatedTitle, translatedDescription } = await translateNewsItem(item.title, item.description);
        return {
          ...item,
          translatedTitle,
          translatedDescription
        };
      })
    );

    console.log('翻译完成!\n');

    const markdown = generateMarkdown(translatedNews, sourceCount);
    const filename = `ai-news-daily-${getTodayDateString()}.md`;
    saveMarkdown(markdown, filename);

    console.log(`\n成功! 共处理 ${news.length} 篇文章，来自 ${sourceCount} 个源。`);
  } catch (error) {
    console.error('生成日报时出错:', error);
    process.exit(1);
  }
}

main();