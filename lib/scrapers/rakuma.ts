import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { Product } from '@/lib/types';

export async function scrapeRakuma(keyword: string): Promise<Product[]> {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  const page = await browser.newPage();

  try {
    // ラクマ検索URL
    const searchUrl = `https://fril.jp/s?query=${encodeURIComponent(keyword)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 10000 });

    // 商品リストを取得（セレクタは要調整）
    const products = await page.evaluate(() => {
      const items: any[] = [];
      const productElements = document.querySelectorAll('.item');

      productElements.forEach((el, index) => {
        if (index >= 20) return; // 最大20件

        const titleEl = el.querySelector('.item-box__item-name');
        const priceEl = el.querySelector('.item-box__item-price');
        const linkEl = el.querySelector('a');

        if (titleEl && priceEl && linkEl) {
          items.push({
            title: titleEl.textContent?.trim() || '',
            price: parseInt(priceEl.textContent?.replace(/[^0-9]/g, '') || '0'),
            url: linkEl.href,
          });
        }
      });

      return items;
    });

    await browser.close();

    // Product型に変換
    return products.map((p, index) => ({
      id: `rakuma-${Date.now()}-${index}`,
      title: p.title,
      price: p.price,
      url: p.url,
      site: 'rakuma' as const,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Rakuma scraping error:', error);
    await browser.close();
    return [];
  }
}
