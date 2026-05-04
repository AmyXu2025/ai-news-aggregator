import axios from 'axios';

function isChineseText(text: string): boolean {
  const chineseCharCount = text.match(/[\u4e00-\u9fff]/g);
  return chineseCharCount !== null && chineseCharCount.length > text.length * 0.3;
}

const proxyHost = '127.0.0.1';
const proxyPort = 7897;

export async function translateText(text: string): Promise<string> {
  if (!text || text.trim() === '') {
    return text;
  }

  if (isChineseText(text)) {
    return text;
  }

  if (text.length > 500) {
    text = text.substring(0, 500);
  }

  const proxyConfig = {
    host: proxyHost,
    port: proxyPort,
    protocol: 'http' as const
  };

  try {
    const response = await axios.get('https://translate.googleapis.com/translate_a/single', {
      params: {
        client: 'gtx',
        sl: 'en',
        tl: 'zh-CN',
        dt: 't',
        q: text
      },
      proxy: proxyConfig,
      timeout: 10000
    });

    if (response.data && response.data[0]) {
      const translatedText = response.data[0].map((item: any[]) => item[0]).join('');
      if (translatedText && translatedText.trim() && translatedText !== text) {
        return translatedText;
      }
    }
  } catch (error) {
    console.warn('Google Translate 失败');
  }

  try {
    const response = await axios.get('https://api.mymemory.translated.net/get', {
      params: {
        langpair: 'en|zh-CN',
        q: text
      },
      proxy: proxyConfig,
      timeout: 10000
    });

    if (response.data && response.data.responseData) {
      const translatedText = response.data.responseData.translatedText;
      if (translatedText && translatedText.trim() && translatedText !== text) {
        return translatedText;
      }
    }
  } catch (error) {
    console.warn('MyMemory 失败');
  }

  return text;
}

export async function translateNewsItem(title: string, description: string): Promise<{ translatedTitle: string; translatedDescription: string }> {
  const translatedTitle = await translateText(title);

  let translatedDescription = '';
  if (description && description.trim()) {
    translatedDescription = await translateText(description);
  } else {
    translatedDescription = translatedTitle;
  }

  return {
    translatedTitle,
    translatedDescription
  };
}