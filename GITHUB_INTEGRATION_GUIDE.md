# GitHub統合ガイド - チケット管理システム

## 🎯 概要
Vibey Technologiesでは、GitHub Issues と GitHub Projects を使用してチケット管理を行います。

## 📋 GitHub Projects の構成

### プロジェクトボード構造
各プロジェクトには以下のボードを設定します：

```
📊 プロジェクトボード
├── 📥 Backlog      - 未着手のタスク
├── 🎯 Ready        - 開発準備完了
├── 💻 In Progress  - 作業中
├── 👀 In Review    - レビュー中
├── ✅ Done         - 完了
└── 🚫 Blocked      - ブロック中
```

## 🏷️ Issue ラベル体系

### タイプ別ラベル
- `type: bug` - バグ修正
- `type: feature` - 新機能
- `type: enhancement` - 機能改善
- `type: documentation` - ドキュメント
- `type: refactoring` - リファクタリング
- `type: test` - テスト

### 優先度ラベル
- `priority: critical` - 緊急対応必要
- `priority: high` - 高優先度
- `priority: medium` - 中優先度
- `priority: low` - 低優先度

### ステータスラベル
- `status: ready-for-dev` - 開発可能
- `status: in-progress` - 作業中
- `status: blocked` - ブロック中
- `status: needs-review` - レビュー必要

### その他のラベル
- `good-first-issue` - 初心者向け
- `help-wanted` - 助けが必要
- `wontfix` - 対応しない
- `duplicate` - 重複

## 📝 Issue テンプレート

### 機能開発テンプレート
```markdown
## 概要
[機能の簡潔な説明]

## 背景・目的
[なぜこの機能が必要か]

## 要件
- [ ] 要件1
- [ ] 要件2
- [ ] 要件3

## 技術的詳細
[実装に必要な技術情報]

## 受け入れ条件
- [ ] テストが通る
- [ ] ドキュメント更新済み
- [ ] レビュー承認

## 関連Issue
- #関連するIssue番号
```

### バグ報告テンプレート
```markdown
## バグの概要
[バグの簡潔な説明]

## 再現手順
1. 手順1
2. 手順2
3. 手順3

## 期待される動作
[正しい動作]

## 実際の動作
[現在の動作]

## 環境
- OS: 
- ブラウザ: 
- バージョン: 

## スクリーンショット
[必要に応じて]
```

## 🤖 AI開発者のワークフロー

### 1. タスクの確認
```bash
# GitHub CLI を使用した Issue の確認
gh issue list --label "status: ready-for-dev"

# 特定のプロジェクトの Issue を確認
gh issue list --repo sparkminan/claude-code-remote
```

### 2. Issue の選択とアサイン
```bash
# Issue を自分にアサイン
gh issue edit [issue番号] --add-assignee @me

# ステータスを更新
gh issue edit [issue番号] --remove-label "status: ready-for-dev" --add-label "status: in-progress"
```

### 3. ブランチ作成
```bash
# Issue に基づいてブランチ作成
git checkout -b feature/issue-123-websocket-implementation
```

### 4. 作業とコミット
```bash
# コミットメッセージに Issue 番号を含める
git commit -m "feat: implement WebSocket connection (#123)"
```

### 5. Pull Request 作成
```bash
# PR を作成（自動的に Issue とリンク）
gh pr create --title "Feature: WebSocket implementation" --body "Closes #123"
```

## 📊 プロジェクト進捗の可視化

### GitHub Projects の自動化ルール
1. **Issue作成時**: 自動的に Backlog に追加
2. **PR作成時**: In Progress に移動
3. **PR承認時**: In Review に移動
4. **PRマージ時**: Done に移動、Issue 自動クローズ

### カスタムフィールド
- **Story Points**: 見積もりポイント（1, 2, 3, 5, 8, 13）
- **Sprint**: スプリント番号
- **Epic**: 関連するエピック
- **Due Date**: 期限

## 🔄 同期スクリプト

### GitHub データの取得（AI用）
```javascript
// scripts/fetch-github-data.js
const { Octokit } = require("@octokit/rest");

async function fetchProjectData() {
    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    // Issues の取得
    const issues = await octokit.issues.listForRepo({
        owner: 'sparkminan',
        repo: 'claude-code-remote',
        state: 'open'
    });

    // Project データの取得
    const projects = await octokit.projects.listForRepo({
        owner: 'sparkminan',
        repo: 'claude-code-remote'
    });

    return { issues: issues.data, projects: projects.data };
}
```

## 📈 メトリクス収集

### 自動収集されるメトリクス
- **サイクルタイム**: Issue作成からクローズまでの時間
- **リードタイム**: In Progress から Done までの時間
- **スループット**: 週あたりの完了 Issue 数
- **バグ率**: バグ Issue の割合

## 🔐 アクセス管理

### GitHub Fine-grained Personal Access Token
必要な権限：
- `repo` - リポジトリへのフルアクセス
- `project` - プロジェクトボードへのアクセス
- `workflow` - GitHub Actions の実行

### 環境変数設定
```bash
# .env ファイル
GITHUB_TOKEN=your_github_token
GITHUB_OWNER=sparkminan
```

## 📱 通知設定

### Slack/Discord 連携
- Issue 作成時
- PR レビュー要求時
- PR マージ時
- ブロッカー発生時

---
このガイドに従って、GitHub上でのチケット管理を効率的に行ってください。