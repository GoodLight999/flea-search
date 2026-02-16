import { NextRequest, NextResponse } from 'next/server';
import { scrapeMercari, scrapeRakuma, scrapeYahoo } from '@/lib/scrapers';
import { Product, SearchResponse, ErrorResponse } from '@/lib/types';

// Rate Limit用のマップ（本番ではVercel KVを使用）
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const requests = rateLimitMap.get(ip) || [];
  
  // 1分以内のリクエストをフィルタ
  const recentRequests = requests.filter(time => now - time < 60000);
  
  if (recentRequests.length >= 3) {
    return false; // Rate limit exceeded
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Rate Limit チェック
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Too many requests', code: 'RATE_LIMIT' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { keyword, sites = ['mercari', 'rakuma', 'yahoo'] } = body;

    if (!keyword || keyword.trim().length === 0) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Keyword is required', code: 'INVALID_KEYWORD' },
        { status: 400 }
      );
    }

    // 並列スクレイピング
    const results = await Promise.allSettled([
      sites.includes('mercari') ? scrapeMercari(keyword) : Promise.resolve([]),
      sites.includes('rakuma') ? scrapeRakuma(keyword) : Promise.resolve([]),
      sites.includes('yahoo') ? scrapeYahoo(keyword) : Promise.resolve([]),
    ]);

    const [mercariResult, rakumaResult, yahooResult] = results;

    const mercari = mercariResult.status === 'fulfilled' ? mercariResult.value : [];
    const rakuma = rakumaResult.status === 'fulfilled' ? rakumaResult.value : [];
    const yahoo = yahooResult.status === 'fulfilled' ? yahooResult.value : [];

    // 統合結果を価格順にソート
    const merged = [...mercari, ...rakuma, ...yahoo].sort((a, b) => a.price - b.price);

    const response: SearchResponse = {
      merged,
      bySite: {
        mercari,
        rakuma,
        yahoo,
      },
      cached: false,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json<ErrorResponse>(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
