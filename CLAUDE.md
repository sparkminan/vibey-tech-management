# 🚀 Vibey Technologies プロジェクト管理 - Claude Code 初期情報

**最終更新**: 2025年8月3日  
**プロジェクトオーナー**: sparkさん  
**プロジェクト管理者**: PM-Aiden

---

## 🎯 現在の最重要タスク

### 🔥 HENKAKU Archive リアルタイム化プロジェクト実行中！
- **期間**: 2025年8月4日～8月10日（7日間）
- **現在フェーズ**: アーキテクチャ設計（8/4開始）
- **GitHub Issues**: #5, #6, #7
- **Project Board**: https://github.com/users/sparkminan/projects/7

---

## 📋 プロジェクト概要

### 1. Vibey Technologies について
- **会社**: AI開発チームによる革新的プロジェクト推進企業
- **ミッション**: 最高品質のソフトウェアをAI協働で開発
- **現在のプロジェクト数**: 2つ（claude-code-remote, henkaku-ai-archive）

### 2. 現在進行中のプロジェクト

#### 🎮 Claude Code Remote (iPhone遠隔操作)
- **ステータス**: テスト環境構築中
- **優先度**: 高
- **次のマイルストーン**: iPhone実機テスト

#### 📚 HENKAKU AI Archive (コミュニティアーカイブ)
- **ステータス**: リアルタイム化開発中 🔥
- **優先度**: 最高（現在の最優先プロジェクト）
- **技術**: Next.js + Airtable API

---

## 👥 AIチーム体制

### コアチーム（6名）
1. **PM-Aiden**: プロジェクト管理・進捗監視・sparkさん報告
2. **FullStack-Kai**: フルスタック開発リード・アーキテクチャ設計
3. **FullStack-Noa**: フルスタック開発・技術検証・レビュー
4. **QA-Mira**: 品質管理専門（実装禁止・テストのみ）
5. **Security-Zane**: セキュリティ監査・脆弱性検証
6. **UI-Luna**: UI/UXデザイン・ユーザビリティ

### サポートチーム
- **DevOps-Rex**: インフラ・デプロイ・CI/CD自動化

---

## 🛠️ 技術スタック・開発標準

### 共通技術要件
- **言語**: TypeScript 5+ (厳密モード必須)
- **フレームワーク**: Next.js 14+ (App Router)
- **品質基準**: ESLint + Prettier + テストカバレッジ85%+
- **セキュリティ**: OWASP準拠・HTTPS/WSS必須

### パフォーマンス目標
- **Lighthouse**: 全項目90点以上
- **Core Web Vitals**: LCP < 2.5s, FID < 100ms, CLS < 0.1
- **初回表示**: 2秒以内

---

## 📂 重要ファイル・ドキュメント

### 🔥 今すぐ確認すべきドキュメント
1. **開発指示書**: `DEVELOPMENT_START_INSTRUCTIONS.md` - 現在の開発タスク詳細
2. **進捗ダッシュボード**: `HENKAKU_PROJECT_DASHBOARD.md` - リアルタイム進捗
3. **チーム体制**: `TEAM_ORGANIZATION_CHART.md` - 役割・責任分担

### 📚 開発ガイドライン
- **統一開発標準**: `UNIFIED_DEVELOPMENT_STANDARDS.md`
- **GitHub Issue管理**: `GITHUB_ISSUE_MANAGEMENT_GUIDE.md`
- **品質チェックリスト**: `CODE_QUALITY_CHECKLIST.md`

### 🧪 テスター向け
- **GitHub CLIガイド**: `TESTER_GITHUB_CLI_GUIDE.md` - 最新追加！
- **テスト戦略**: `INTEGRATED_TEST_STRATEGY.md`

### 🆕 新規メンバー向け
- **GitHubアカウント設定**: `GITHUB_ACCOUNT_SETUP_GUIDE.md` - アカウント作成から権限取得まで

---

## 🚀 即座に実行すべきコマンド

### プロジェクト状況確認
```bash
# GitHub認証状態確認
gh auth status

# 現在のIssue一覧
gh issue list --repo sparkminan/vibey-tech-management

# HENKAKU Archive関連Issue
gh issue list --repo sparkminan/vibey-tech-management --label "project/henkaku-ai-archive"
```

### npmスクリプト（プロジェクト管理）
```bash
cd vibey-tech-management

# Issue作成・Project設定
npm run henkaku-setup        # 全セットアップ
npm run create-henkaku-issues # Issue作成
npm run add-issues-to-project # Project追加
npm run assign-team-members   # チーム割当
npm run send-kickoff         # キックオフ通知
```

---

## ⚠️ 重要な注意事項

### 1. 役割の厳格化
- **QA-Mira**: テスト・品質確認のみ。実装・修正は絶対禁止
- **開発者**: 実装・修正担当。テストは別途QAが実施

### 2. 品質優先
- スケジュール圧迫でも品質基準は絶対維持
- Lighthouse 90+、バグ0は必須条件

### 3. セキュリティ
- API Key等の機密情報は環境変数で管理
- ハードコーディング絶対禁止

---

## 📞 連絡・エスカレーション

### 通常連絡
- **技術的質問**: 各GitHub Issueにコメント
- **進捗報告**: 毎日17:00にIssue更新

### 緊急連絡
- **ブロッカー**: PM-Aidenに即座メンション
- **セキュリティ問題**: Security-Zaneに緊急連絡
- **sparkさん承認必要**: PM-Aiden経由でエスカレーション

---

## 💡 プロンプト例

### 進捗確認したい時
```
現在のHENKAKU Archiveプロジェクトの進捗状況を教えて。
GitHub Issue #5, #6, #7の状態も含めて。
```

### 開発タスク確認
```
今日やるべき開発タスクは何？
DEVELOPMENT_START_INSTRUCTIONSを基に具体的に教えて。
```

### テスト実行
```
HENKAKU Archiveのテストを実行したい。
QA-Miraとして品質確認を行う手順を教えて。
```

---

## 🎯 本日の優先事項（2025年8月3日）

1. ✅ **完了**: GitHub CLI インストール・設定
2. ✅ **完了**: テスター向けガイド作成
3. 🔄 **進行中**: HENKAKU Archive開発準備
4. ⏳ **明日**: アーキテクチャ設計開始（8/4 09:00）

---

**🚀 このドキュメントを基に、効率的にプロジェクトを進めましょう！**

質問があれば「CLAUDE.mdの〇〇について詳しく」と聞いてください。