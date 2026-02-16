// 商品データの型定義
export interface Product {
  id: string;
  title: string;
  price: number;
  url: string;
  site: 'mercari' | 'rakuma' | 'yahoo';
  thumbnail?: string; // サムネイルURLは任意（著作権リスク低減）
  condition?: string; // 商品状態
  timestamp: string; // 取得日時
}

// 検索リクエストの型
export interface SearchRequest {
  keyword: string;
  sites?: ('mercari' | 'rakuma' | 'yahoo')[];
}

// 検索レスポンスの型
export interface SearchResponse {
  merged: Product[]; // 統合結果（価格順）
  bySite: {
    mercari: Product[];
    rakuma: Product[];
    yahoo: Product[];
  };
  cached: boolean; // キャッシュヒットしたか
  timestamp: string;
}

// エラーレスポンスの型
export interface ErrorResponse {
  error: string;
  code?: string;
}
