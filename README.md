# Vibey Technologies 開発管理センター

## 📋 概要
このリポジトリは、Vibey Technologies社の全プロジェクトを統括管理するためのダッシュボードとドキュメント管理システムです。

## 🏗️ 構造

```
vibey-tech-management/
├── dashboards/              # 進捗ダッシュボード
│   ├── MASTER_DASHBOARD.md # 全体ダッシュボード
│   └── projects/           # プロジェクト別ダッシュボード
├── scripts/                # 自動化スクリプト
│   ├── sync-github-data.js # GitHub データ同期
│   └── generate-reports.js # レポート生成
├── data/                   # キャッシュデータ
│   ├── github-issues.json  # Issues キャッシュ
│   └── project-metrics.json # メトリクスデータ
├── templates/              # テンプレート
└── .github/               # GitHub Actions
```

## 🔗 管理対象プロジェクト

| プロジェクト | GitHubリポジトリ | ステータス |
|------------|----------------|----------|
| claude-code-remote | [sparkminan/claude-code-remote](https://github.com/sparkminan/claude-code-remote) | 準備中 |
| henkaku-ai-archive | [sparkminan/henkaku-ai-archive](https://github.com/sparkminan/henkaku-ai-archive) | アクティブ |

## 🚀 使い方

### 1. 初回セットアップ
```bash
npm install
npm run setup
```

### 2. GitHub データの同期
```bash
npm run sync
```

### 3. ダッシュボード生成
```bash
npm run generate-dashboard
```

## 📊 ダッシュボード

- [マスターダッシュボード](dashboards/MASTER_DASHBOARD.md) - 全プロジェクトの概要
- [プロジェクト別ダッシュボード](dashboards/projects/) - 各プロジェクトの詳細

## 🤖 AI開発者向けガイド

### GitHub Issuesの確認方法
1. 各プロジェクトのGitHub Issuesページにアクセス
2. ラベルでフィルタリング（`ready-for-dev`, `bug`, `enhancement`など）
3. アサインされたIssueから作業開始

### 作業フロー
1. **Issue選択**: GitHub Issuesから作業するチケットを選択
2. **ブランチ作成**: `feature/issue-番号-概要`の形式で作成
3. **開発**: Issue内の要件に従って実装
4. **PR作成**: レビュー用のPull Requestを作成
5. **更新**: Issueのステータスを更新

## 🔐 アクセス権限

このリポジトリはプライベートリポジトリとして管理され、sparkさんのみがアクセス可能です。

---
最終更新: 2025-08-03