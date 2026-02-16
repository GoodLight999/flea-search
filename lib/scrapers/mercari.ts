import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { Product } from '@/lib/types';

export async function scrapeMercari(keyword: string): Promise<Product[]> {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  const page = await browser.newPage();

  try {
    // メルカリ検索URL
    const searchUrl = `https://jp.mercari.com/search?keyword=${encodeURIComponent(keyword)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 10000 });

    // 商品リストを取得（セレクタは要調整）
    const products = await page.evaluate(() => {
      const items: any[] = [];
      const productElements = document.querySelectorAll('[data-testid="item-cell"]');

      productElements.forEach((el, index) => {
        if (index >= 20) return; // 最大20件

        const titleEl = el.querySelector('span');
        const priceEl = el.querySelector('[data-testid="price"]');
        const linkEl = el.querySelector('a');

        if (titleEl && priceEl && linkEl) {
          items.push({
            title: titleEl.textContent?.trim() || '',
            price: parseInt(priceEl.textContent?.replace(/[^0-9]/g, '') || '0'),
            url: `https://jp.mercari.com${linkEl.getAttribute('href')}`,
          });
        }
      });

      return items;
    });

    await browser.close();

    // Product型に変換
    return products.map((p, index) => ({
      id: `mercari-${Date.now()}-${index}`,
      title: p.title,
      price: p.price,
      url: p.url,
      site: 'mercari' as const,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Mercari scraping error:', error);
    await browser.close();
    return [];
  }
}
