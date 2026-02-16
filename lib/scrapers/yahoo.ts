import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { Product } from '@/lib/types';

export async function scrapeYahoo(keyword: string): Promise<Product[]> {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless,
  });

  const page = await browser.newPage();

  try {
    // Yahoo!フリマ検索URL
    const searchUrl = `https://paypayfleamarket.yahoo.co.jp/search/${encodeURIComponent(keyword)}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 10000 });

    // 商品リストを取得（セレクタは要調整）
    const products = await page.evaluate(() => {
      const items: any[] = [];
      const productElements = document.querySelectorAll('[class*="Product_product"]');

      productElements.forEach((el, index) => {
        if (index >= 20) return; // 最大20件

        const titleEl = el.querySelector('[class*="Product_name"]');
        const priceEl = el.querySelector('[class*="Product_price"]');
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
      id: `yahoo-${Date.now()}-${index}`,
      title: p.title,
      price: p.price,
      url: p.url,
      site: 'yahoo' as const,
      timestamp: new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Yahoo scraping error:', error);
    await browser.close();
    return [];
  }
}
