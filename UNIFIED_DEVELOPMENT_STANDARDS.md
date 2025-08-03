# Vibey Technologies 統一開発標準

**Version**: 1.0  
**最終更新**: 2025年8月3日  
**適用範囲**: 全社プロジェクト

---

## 📋 概要

本文書は、Vibey Technologiesの全プロジェクトにおける開発品質を統一し、持続可能で安全なソフトウェア開発を実現するための標準規約です。

## 🎯 品質目標

| 指標 | 目標値 | 測定方法 |
|-----|-------|---------|
| **コードカバレッジ** | 80%以上 | Jest/Vitest |
| **セキュリティスコア** | A以上 | OWASP基準 |
| **パフォーマンス** | Lighthouse 90+ | 自動計測 |
| **アクセシビリティ** | WCAG 2.1 AA | axe-core |
| **バグ検出率** | 製品リリース前95% | 静的解析+テスト |

---

## 🏗 アーキテクチャ原則

### 1. 設計原則
- **Single Responsibility**: 各モジュールは単一の責任を持つ
- **Open/Closed**: 拡張に開かれ、修正に閉じられた設計
- **Interface Segregation**: 必要以上のインターフェースを強要しない
- **Dependency Inversion**: 抽象に依存し、具象に依存しない

### 2. 技術選択基準
```markdown
優先度1: セキュリティ・安全性
優先度2: 保守性・可読性
優先度3: パフォーマンス
優先度4: 開発効率
```

### 3. プロジェクト構造標準
```
project-name/
├── src/                    # ソースコード
│   ├── components/         # 再利用可能コンポーネント
│   ├── pages/             # ページ・ルート
│   ├── hooks/             # カスタムフック
│   ├── utils/             # ユーティリティ関数
│   ├── types/             # TypeScript型定義
│   └── constants/         # 定数定義
├── tests/                 # テストファイル
│   ├── unit/              # ユニットテスト
│   ├── integration/       # 統合テスト
│   └── e2e/               # E2Eテスト
├── docs/                  # ドキュメント
├── .github/               # GitHub設定
│   ├── workflows/         # CI/CD
│   └── ISSUE_TEMPLATE/    # Issue テンプレート
└── README.md              # プロジェクト概要
```

---

## 💻 コーディング標準

### 1. 命名規約

#### JavaScript/TypeScript
```typescript
// 変数・関数: camelCase
const userName = 'john';
const fetchUserData = () => {};

// 定数: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.example.com';

// クラス・コンポーネント: PascalCase
class UserManager {}
const UserCard = () => {};

// インターフェース: PascalCase + I接頭辞（推奨）
interface IUser {
  id: string;
  name: string;
}
```

#### ファイル名
```
components/UserCard.tsx        # コンポーネント: PascalCase
hooks/useUserData.ts          # フック: camelCase
utils/date-formatter.ts       # ユーティリティ: kebab-case
types/user.types.ts           # 型定義: kebab-case + .types
```

### 2. コードフォーマット

#### 必須ツール
- **ESLint**: コード品質チェック
- **Prettier**: コードフォーマット
- **TypeScript**: 型安全性

#### 設定例（.eslintrc.js）
```javascript
module.exports = {
  extends: [
    '@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error',
    '@typescript-eslint/no-any': 'warn',
    'prefer-const': 'error'
  }
};
```

### 3. TypeScript使用義務
```typescript
// ❌ 悪い例
function processData(data: any) {
  return data.map(item => item.value);
}

// ✅ 良い例
interface DataItem {
  id: string;
  value: number;
}

function processData(data: DataItem[]): number[] {
  return data.map(item => item.value);
}
```

---

## 🛡 セキュリティ標準

### 1. 必須セキュリティ要件

#### 認証・認可
```typescript
// JWT実装例
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

// パスワードハッシュ化（必須）
const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, 12); // 12ラウンド以上
};

// 環境変数からシークレット取得（必須）
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required');
}
```

#### HTTPS/WSS強制
```javascript
// Express設定例
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

### 2. 入力検証
```typescript
import Joi from 'joi';

// バリデーションスキーマ
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
});

// 使用例
const validateUser = (userData: unknown) => {
  const { error, value } = userSchema.validate(userData);
  if (error) throw new Error(`Validation failed: ${error.message}`);
  return value;
};
```

### 3. 環境変数管理
```bash
# .env.example
DB_CONNECTION_STRING=postgresql://user:pass@localhost:5432/db
JWT_SECRET=your-super-secret-key-change-this
API_RATE_LIMIT=100
ENCRYPTION_KEY=32-character-random-string
```

---

## 🧪 テスト戦略

### 1. テストピラミッド
```
    /\
   /  \     E2E Tests (10%)
  /____\    Integration Tests (20%)
 /______\   Unit Tests (70%)
```

### 2. 必須テストタイプ

#### ユニットテスト
```typescript
// utils/date-formatter.test.ts
import { formatDate } from './date-formatter';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2025-08-03');
    expect(formatDate(date)).toBe('2025-08-03');
  });

  it('should handle invalid date', () => {
    expect(() => formatDate(null)).toThrow('Invalid date');
  });
});
```

#### コンポーネントテスト（React）
```typescript
// components/UserCard.test.tsx
import { render, screen } from '@testing-library/react';
import UserCard from './UserCard';

describe('UserCard', () => {
  it('should display user information', () => {
    const user = { id: '1', name: 'John Doe', email: 'john@example.com' };
    render(<UserCard user={user} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});
```

#### E2Eテスト（Cypress）
```typescript
// cypress/e2e/user-flow.cy.ts
describe('User Authentication Flow', () => {
  it('should login and access dashboard', () => {
    cy.visit('/login');
    cy.get('[data-testid=email]').type('user@example.com');
    cy.get('[data-testid=password]').type('password123');
    cy.get('[data-testid=login-button]').click();
    
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid=welcome-message]').should('be.visible');
  });
});
```

### 3. カバレッジ目標
- **ユニットテスト**: 80%以上
- **統合テスト**: 主要フロー100%
- **E2Eテスト**: クリティカルパス100%

---

## 🚀 CI/CDパイプライン

### 1. 必須ステップ
```yaml
# .github/workflows/main.yml
name: CI/CD Pipeline

on: [push, pull_request]

jobs:
  quality-checks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # 依存関係インストール
      - name: Install dependencies
        run: npm ci
        
      # Lint チェック
      - name: Run ESLint
        run: npm run lint
        
      # 型チェック
      - name: Type check
        run: npm run type-check
        
      # テスト実行
      - name: Run tests
        run: npm run test:coverage
        
      # セキュリティスキャン
      - name: Security audit
        run: npm audit --audit-level high
        
      # ビルド確認
      - name: Build
        run: npm run build
```

### 2. ブランチ戦略
```
main (保護)
├── develop (開発統合)
├── feature/xxx (機能開発)
├── bugfix/xxx (バグ修正)
└── hotfix/xxx (緊急修正)
```

### 3. プルリクエスト要件
- [ ] すべてのCI/CDチェックがパス
- [ ] コードレビュー1名以上の承認
- [ ] テストカバレッジ基準をクリア
- [ ] セキュリティスキャンにパス

---

## 📚 ドキュメント標準

### 1. 必須ドキュメント
- **README.md**: プロジェクト概要・セットアップ
- **CONTRIBUTING.md**: 貢献ガイドライン
- **CHANGELOG.md**: 変更履歴
- **API.md**: API仕様（該当プロジェクト）

### 2. コメント標準
```typescript
/**
 * ユーザーデータを取得する
 * @param userId - ユーザーID
 * @param options - 取得オプション
 * @returns Promise<User> ユーザー情報
 * @throws {NotFoundError} ユーザーが見つからない場合
 */
async function fetchUser(
  userId: string, 
  options: FetchOptions = {}
): Promise<User> {
  // 実装...
}
```

### 3. API仕様書
```yaml
# OpenAPI 3.0形式推奨
openapi: 3.0.0
info:
  title: Project API
  version: 1.0.0
paths:
  /users/{id}:
    get:
      summary: Get user by ID
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: User information
```

---

## 🔍 品質保証プロセス

### 1. コードレビューチェックリスト
- [ ] **機能要件**: 仕様通りに実装されているか
- [ ] **設計**: アーキテクチャ原則に準拠しているか
- [ ] **セキュリティ**: 脆弱性がないか
- [ ] **パフォーマンス**: 非効率な処理がないか
- [ ] **テスト**: 適切なテストが含まれているか
- [ ] **ドキュメント**: 必要な文書が更新されているか

### 2. リリース前チェック
- [ ] 全自動テストが通過
- [ ] セキュリティスキャン実施
- [ ] パフォーマンステスト実施
- [ ] ドキュメント更新完了
- [ ] CHANGELOG.md更新

### 3. 品質メトリクス監視
```javascript
// 品質監視例（GitHub Actions）
const qualityGates = {
  coverage: 80,           // テストカバレッジ
  bugs: 0,               // バグ数
  vulnerabilities: 0,     // 脆弱性数
  maintainability: 'A',   // 保守性評価
  reliability: 'A'        // 信頼性評価
};
```

---

## 🚨 例外処理・エラーハンドリング

### 1. エラー分類
```typescript
// カスタムエラークラス
export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(`Validation failed for ${field}: ${message}`);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(resource: string, id: string) {
    super(`${resource} with id ${id} not found`);
    this.name = 'NotFoundError';
  }
}
```

### 2. ログ出力標準
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// 使用例
logger.error('Database connection failed', {
  error: error.message,
  stack: error.stack,
  userId: request.user.id
});
```

---

## 📊 パフォーマンス基準

### 1. Web Performance
- **First Contentful Paint**: < 1.5秒
- **Largest Contentful Paint**: < 2.5秒
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

### 2. API Performance
- **レスポンス時間**: < 200ms (90パーセンタイル)
- **スループット**: > 1000 req/sec
- **エラー率**: < 0.1%

---

## 🔄 継続的改善

### 1. 定期レビュー
- **週次**: コード品質メトリクス確認
- **月次**: 標準の見直し・更新
- **四半期**: 技術選択の評価

### 2. フィードバック収集
- 開発者からの改善提案
- ユーザーからの品質報告
- 外部監査結果の反映

---

## 📞 問い合わせ・例外申請

品質標準に関する質問や例外申請は以下の手順で行う：

1. **GitHub Discussion**でまず相談
2. **技術検討会**での審議
3. **PM承認**による例外許可

---

**この標準は生きた文書です。技術の進歩とプロジェクトの成長に合わせて継続的に更新されます。**