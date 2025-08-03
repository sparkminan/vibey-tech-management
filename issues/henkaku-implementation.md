# [FEATURE] HENKAKU Archive Airtableリアルタイム表示 実装

**ラベル**: `type/feature`, `priority/critical`, `project/henkaku-ai-archive`, `area/fullstack`, `automation/ai-task`

---

## 🎯 機能概要
設計されたアーキテクチャに基づき、HENKAKU Archive の Airtable リアルタイム動的データ取得システムを実装

## 📋 前提条件
- **前提Issue**: [TASK] HENKAKU Archive Airtableリアルタイム表示 アーキテクチャ設計の完了
- **設計書**: 技術設計書・API仕様書・キャッシュ戦略の確定
- **技術選定**: Next.js・キャッシュソリューション・インフラの決定

## 🔧 実装要件

### Phase 1: コア機能実装 (1.5日)

#### Airtable API統合
```typescript
// lib/airtable.ts - Airtable API クライアント
import Airtable from 'airtable';

interface AirtableConfig {
  baseId: string;
  tableId: string;
  apiKey: string;
  fields: string[];
}

export class HenkakuAirtableClient {
  private base: Airtable.Base;
  
  constructor(config: AirtableConfig) {
    this.base = new Airtable({ apiKey: config.apiKey }).base(config.baseId);
  }
  
  async fetchRecords(options?: {
    filterByFormula?: string;
    sort?: Array<{ field: string; direction: 'asc' | 'desc' }>;
    maxRecords?: number;
  }): Promise<HenkakuItem[]> {
    // Airtable API 呼び出し・エラーハンドリング・リトライ機能
  }
  
  async fetchRecordsSince(since: Date): Promise<{
    items: HenkakuItem[];
    deleted: string[];
  }> {
    // 増分更新取得
  }
}
```

#### データ変換層
```typescript
// lib/transform.ts - Airtable → Next.js データ変換
export interface HenkakuItem {
  id: string;
  title: string;
  description: string;
  category: 'Research' | 'Tools' | 'Community' | 'News';
  date: string;
  url: string;
  image?: string;
  tags: string[];
  published: boolean;
  featured: boolean;
}

export function transformAirtableRecord(record: any): HenkakuItem {
  return {
    id: record.id,
    title: sanitizeHtml(record.fields.Title || ''),
    description: sanitizeHtml(record.fields.Description || ''),
    category: validateCategory(record.fields.Category),
    date: parseDate(record.fields.Date),
    url: validateUrl(record.fields.URL),
    image: record.fields.Image?.[0]?.url,
    tags: parseTags(record.fields.Tags),
    published: Boolean(record.fields.Published),
    featured: Boolean(record.fields.Featured)
  };
}
```

#### API Routes実装
```typescript
// app/api/henkaku/items/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { HenkakuAirtableClient } from '@/lib/airtable';
import { getCachedData, setCachedData } from '@/lib/cache';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const limit = parseInt(searchParams.get('limit') || '20');
  
  try {
    // キャッシュ確認
    const cacheKey = `henkaku-items-${category}-${limit}`;
    const cachedData = await getCachedData(cacheKey);
    
    if (cachedData) {
      return NextResponse.json({
        data: cachedData,
        cached: true,
        timestamp: new Date().toISOString()
      });
    }
    
    // Airtable からデータ取得
    const client = new HenkakuAirtableClient({
      baseId: process.env.AIRTABLE_BASE_ID!,
      tableId: process.env.AIRTABLE_TABLE_ID!,
      apiKey: process.env.AIRTABLE_API_KEY!,
      fields: ['Title', 'Description', 'Category', 'Date', 'URL', 'Image', 'Tags', 'Published', 'Featured']
    });
    
    const records = await client.fetchRecords({
      filterByFormula: category ? `{Category} = "${category}"` : `{Published} = TRUE()`,
      sort: [{ field: 'Date', direction: 'desc' }],
      maxRecords: limit
    });
    
    // キャッシュ保存 (5分間)
    await setCachedData(cacheKey, records, 300);
    
    return NextResponse.json({
      data: records,
      cached: false,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Airtable API Error:', error);
    
    // フォールバックデータ
    const fallbackData = await getFallbackData();
    
    return NextResponse.json({
      data: fallbackData,
      error: 'Failed to fetch from Airtable',
      fallback: true
    }, { status: 206 }); // Partial Content
  }
}
```

#### キャッシュ層実装
```typescript
// lib/cache.ts - キャッシュ抽象化レイヤー
interface CacheClient {
  get(key: string): Promise<any>;
  set(key: string, value: any, ttl: number): Promise<void>;
  del(key: string): Promise<void>;
}

// Vercel KV 実装
export class VercelKVCache implements CacheClient {
  async get(key: string) {
    const { kv } = await import('@vercel/kv');
    return await kv.get(key);
  }
  
  async set(key: string, value: any, ttl: number) {
    const { kv } = await import('@vercel/kv');
    await kv.setex(key, ttl, JSON.stringify(value));
  }
  
  async del(key: string) {
    const { kv } = await import('@vercel/kv');
    await kv.del(key);
  }
}

// メモリキャッシュ フォールバック
export class MemoryCache implements CacheClient {
  private cache = new Map<string, { value: any; expires: number }>();
  
  async get(key: string) {
    const item = this.cache.get(key);
    if (item && item.expires > Date.now()) {
      return JSON.parse(item.value);
    }
    this.cache.delete(key);
    return null;
  }
  
  async set(key: string, value: any, ttl: number) {
    this.cache.set(key, {
      value: JSON.stringify(value),
      expires: Date.now() + (ttl * 1000)
    });
  }
  
  async del(key: string) {
    this.cache.delete(key);
  }
}
```

### Phase 2: フロントエンド実装 (1日)

#### 動的タイルコンポーネント
```typescript
// components/HenkakuTileGrid.tsx
'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { HenkakuItem } from '@/lib/types';

interface TileGridProps {
  initialData?: HenkakuItem[];
  category?: string;
  limit?: number;
}

export function HenkakuTileGrid({ initialData, category, limit = 20 }: TileGridProps) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/henkaku/items?category=${category || ''}&limit=${limit}`,
    fetcher,
    {
      fallbackData: initialData,
      refreshInterval: 5 * 60 * 1000, // 5分間隔で更新
      revalidateOnFocus: true,
      dedupingInterval: 60 * 1000 // 1分間は重複リクエスト防止
    }
  );
  
  if (error) {
    return (
      <ErrorBoundary 
        error={error}
        onRetry={() => mutate()}
        fallbackData={initialData}
      />
    );
  }
  
  if (isLoading && !data) {
    return <SkeletonTileGrid count={limit} />;
  }
  
  return (
    <div className="tile-grid">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {data?.data?.map((item: HenkakuItem) => (
          <TileCard
            key={item.id}
            item={item}
            loading={isLoading}
          />
        ))}
      </div>
      
      {data?.cached && (
        <div className="text-sm text-gray-500 mt-4">
          📡 キャッシュから表示 | 更新: {formatDate(data.timestamp)}
        </div>
      )}
    </div>
  );
}
```

#### レスポンシブタイルカード
```typescript
// components/TileCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { HenkakuItem } from '@/lib/types';

interface TileCardProps {
  item: HenkakuItem;
  loading?: boolean;
}

export function TileCard({ item, loading }: TileCardProps) {
  return (
    <article className={`
      bg-white rounded-lg shadow-sm border border-gray-200 
      hover:shadow-md transition-shadow duration-200
      ${loading ? 'animate-pulse' : ''}
    `}>
      {item.image && (
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <Image
            src={item.image}
            alt={item.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            priority={item.featured}
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <CategoryBadge category={item.category} />
          {item.featured && <FeaturedBadge />}
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {item.url ? (
            <Link 
              href={item.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
            >
              {item.title}
            </Link>
          ) : (
            item.title
          )}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {item.description}
        </p>
        
        <div className="flex items-center justify-between">
          <time className="text-xs text-gray-500">
            {formatDate(item.date)}
          </time>
          
          {item.tags.length > 0 && (
            <div className="flex gap-1">
              {item.tags.slice(0, 2).map(tag => (
                <span 
                  key={tag}
                  className="px-2 py-1 bg-gray-100 text-xs rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
```

#### ページ実装 (SSR + SWR)
```typescript
// app/page.tsx
import { Suspense } from 'react';
import { HenkakuTileGrid } from '@/components/HenkakuTileGrid';
import { HenkakuAirtableClient } from '@/lib/airtable';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'HENKAKU AI Archive - Latest AI Research & Tools',
  description: 'Real-time archive of AI research, tools, and community updates',
  openGraph: {
    title: 'HENKAKU AI Archive',
    description: 'Real-time archive of AI research, tools, and community updates',
    url: 'https://henkaku-ai-archive.vercel.app',
    type: 'website'
  }
};

// ISR with 5 minute revalidation
export const revalidate = 300;

async function getInitialData(): Promise<HenkakuItem[]> {
  try {
    const client = new HenkakuAirtableClient({
      baseId: process.env.AIRTABLE_BASE_ID!,
      tableId: process.env.AIRTABLE_TABLE_ID!,
      apiKey: process.env.AIRTABLE_API_KEY!,
      fields: ['Title', 'Description', 'Category', 'Date', 'URL', 'Image', 'Tags', 'Published', 'Featured']
    });
    
    return await client.fetchRecords({
      filterByFormula: `{Published} = TRUE()`,
      sort: [{ field: 'Date', direction: 'desc' }],
      maxRecords: 20
    });
  } catch (error) {
    console.error('Failed to fetch initial data:', error);
    return []; // フォールバック
  }
}

export default async function HomePage() {
  const initialData = await getInitialData();
  
  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          HENKAKU AI Archive
        </h1>
        <p className="text-gray-600">
          リアルタイム AI研究・ツール・コミュニティアーカイブ
        </p>
      </header>
      
      <Suspense fallback={<SkeletonTileGrid count={20} />}>
        <HenkakuTileGrid initialData={initialData} />
      </Suspense>
    </main>
  );
}
```

### Phase 3: 最適化・監視 (0.5日)

#### エラーハンドリング・監視
```typescript
// lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

export function trackAirtableError(error: Error, context: any) {
  Sentry.captureException(error, {
    tags: {
      service: 'airtable',
      operation: context.operation
    },
    extra: context
  });
}

export function trackPerformance(operation: string, duration: number) {
  Sentry.addBreadcrumb({
    message: `${operation} completed`,
    level: 'info',
    data: { duration }
  });
}
```

#### パフォーマンス最適化
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@/components', '@/lib']
  },
  
  images: {
    domains: ['dl.airtable.com'],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 768, 1024, 1280, 1600],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  },
  
  // キャッシュ最適化
  async headers() {
    return [
      {
        source: '/api/henkaku/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=600'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
```

## 📊 受け入れ条件

### 必須機能
- [ ] **動的データ取得**: 毎回のページアクセス時に最新Airtableデータ表示
- [ ] **タイル動的表示**: 取得データに基づく美しいタイル表示
- [ ] **レスポンシブ対応**: Mobile・Tablet・PC全対応
- [ ] **エラーハンドリング**: API障害時の適切なフォールバック
- [ ] **キャッシュ機能**: 5分間キャッシュでパフォーマンス向上

### パフォーマンス基準
- [ ] **初回表示**: 2秒以内
- [ ] **Lighthouse Score**: Performance 90+, SEO 90+, Accessibility 90+
- [ ] **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- [ ] **API応答時間**: 500ms以内

### 品質基準
- [ ] **TypeScript**: 100%型安全実装
- [ ] **コードカバレッジ**: 85%以上
- [ ] **ESLint/Prettier**: 設定済み・警告0件
- [ ] **セキュリティ**: API キー環境変数管理・XSS対策

## 🧪 テスト実装

### 単体テスト
```typescript
// __tests__/lib/airtable.test.ts
describe('HenkakuAirtableClient', () => {
  test('正常データ取得', async () => {
    const client = new HenkakuAirtableClient(mockConfig);
    const records = await client.fetchRecords();
    
    expect(records).toHaveLength(10);
    expect(records[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      published: true
    });
  });
  
  test('API エラー時のリトライ', async () => {
    const client = new HenkakuAirtableClient(mockConfig);
    
    // 3回失敗後成功をモック
    mockAirtableAPI.mockRejectedValueOnce(new Error('Rate limit'))
                   .mockRejectedValueOnce(new Error('Rate limit'))
                   .mockRejectedValueOnce(new Error('Rate limit'))
                   .mockResolvedValueOnce(mockResponse);
    
    const records = await client.fetchRecords();
    expect(mockAirtableAPI).toHaveBeenCalledTimes(4);
    expect(records).toBeDefined();
  });
});
```

### 統合テスト
```typescript
// __tests__/api/henkaku.test.ts
describe('/api/henkaku/items', () => {
  test('正常レスポンス', async () => {
    const response = await fetch('/api/henkaku/items');
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      data: expect.any(Array),
      cached: expect.any(Boolean),
      timestamp: expect.any(String)
    });
  });
  
  test('キャッシュ機能', async () => {
    // 1回目のリクエスト
    const response1 = await fetch('/api/henkaku/items');
    const data1 = await response1.json();
    
    // 2回目のリクエスト（キャッシュから）
    const response2 = await fetch('/api/henkaku/items');
    const data2 = await response2.json();
    
    expect(data1.cached).toBe(false);
    expect(data2.cached).toBe(true);
  });
});
```

## 👥 担当・連携

### メイン担当
- **@FullStack-Kai**: フロントエンド・UI・Next.js実装
- **@FullStack-Noa**: バックエンド・API・Airtable統合・キャッシュ

### 連携メンバー
- **@UI-Luna**: レスポンシブデザイン・UX確認
- **@DevOps-Rex**: デプロイ・環境設定・監視設定
- **@Security-Zane**: API認証・セキュリティレビュー

### 品質確認
- **@QA-Mira**: 実装テスト・品質確認・バグ報告のみ（修正は開発者担当）

## 📅 スケジュール

### 実装期間: 3日間
- **Day 1**: Airtable API統合・キャッシュ層・API Routes
- **Day 2**: フロントエンド・コンポーネント・ページ実装
- **Day 3**: 最適化・テスト・デプロイ準備

### マイルストーン
- **8/5**: Phase 1 完了（API・キャッシュ）
- **8/6**: Phase 2 完了（フロントエンド）
- **8/7**: Phase 3 完了（最適化・デプロイ）

## 💰 工数・予算見積もり

- **実装工数**: 24時間 (3日 × 8時間)
- **担当者**: FullStack-Kai + FullStack-Noa
- **予算**: ¥300,000 (開発費) + ¥100,000 (インフラ・キャッシュ)
- **期限**: 2025/8/7 完了目標

## 🔗 関連Issue・リソース

- **前提**: [TASK] HENKAKU Archive Airtableリアルタイム表示 アーキテクチャ設計
- **後続**: [QUALITY] HENKAKU Archive リアルタイム表示 テスト実行
- **参考**: [現在のサイト](https://sparkminan.github.io/henkaku-ai-archive/)

## 📝 完了基準

- [ ] 全受け入れ条件クリア
- [ ] パフォーマンス基準達成
- [ ] テストカバレッジ85%以上
- [ ] 本番環境デプロイ成功
- [ ] QA-Miraによる品質確認完了
- [ ] sparkさんによる動作確認・承認

---

**この実装により、HENKAKU Archiveは真のリアルタイム・動的アーカイブに進化します！**

技術的な質問・要望があれば実装に反映いたします 🚀