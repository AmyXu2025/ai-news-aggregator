import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { NewsItem } from './types.js';

export function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

export function getTodayDateString(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateMarkdown(news: NewsItem[], sourceCount: number): string {
  const dateStr = getTodayDateString();
  const totalCount = news.length;

  let markdown = `# AI新闻日报 - ${dateStr}\n\n`;
  markdown += `> 共收录 **${totalCount}** 篇文章，来自 **${sourceCount}** 个源\n\n`;
  markdown += `---\n\n`;

  news.forEach((item, index) => {
    const title = item.translatedTitle || item.title;
    const description = item.translatedDescription || item.description;

    markdown += `## ${index + 1}. ${title}\n\n`;
    markdown += `- **来源**: ${item.source}\n`;
    markdown += `- **发布时间**: ${formatDate(item.pubDate)}\n`;
    markdown += `- **链接**: [阅读原文](${item.link})\n`;

    if (description && description.trim() && description.length > 10) {
      markdown += `- **摘要**: ${description}\n`;
    }

    markdown += `\n---\n\n`;
  });

  return markdown;
}

export function saveMarkdown(content: string, filename: string): void {
  const outputDir = 'Output';

  if (!existsSync(outputDir)) {
    mkdirSync(outputDir, { recursive: true });
  }

  const filepath = `${outputDir}/${filename}`;
  writeFileSync(filepath, content, 'utf-8');
  console.log(`日报已生成: ${filepath}`);
}