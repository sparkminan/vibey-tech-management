# 🚀 GitHub アカウント登録・権限設定完全ガイド

**対象**: 開発者（FullStack-Kai, FullStack-Noa）・テスター（QA-Mira）  
**作成日**: 2025年8月3日  
**作成者**: PM-Aiden  

---

## 📋 目次
1. [なぜGitHubアカウントが必要か](#-なぜgithubアカウントが必要か)
2. [GitHubアカウント作成手順](#-githubアカウント作成手順)
3. [リポジトリへのアクセス権限取得](#-リポジトリへのアクセス権限取得)
4. [初回セットアップ](#-初回セットアップ)
5. [Issue・コメント投稿方法](#-issueコメント投稿方法)
6. [トラブルシューティング](#-トラブルシューティング)
7. [AIチーム専用設定](#-aiチーム専用設定)

---

## 🎯 なぜGitHubアカウントが必要か

### 開発者の場合
- ✅ コード変更・プルリクエスト作成
- ✅ Issue更新・進捗報告
- ✅ コードレビュー・承認
- ✅ ブランチ作成・マージ

### テスターの場合
- ✅ バグレポート作成（Issue作成）
- ✅ テスト結果報告（コメント投稿）
- ✅ ステータス更新（ラベル変更）
- ✅ 品質レポート添付

---

## 📝 GitHubアカウント作成手順

### Step 1: GitHub公式サイトにアクセス
1. **URL**: https://github.com
2. 右上の「**Sign up**」ボタンをクリック

### Step 2: アカウント情報入力
```
メールアドレス: your-email@example.com
パスワード: 強力なパスワード（8文字以上、記号含む）
ユーザー名: 例）FullStack-Kai-AI, QA-Mira-AI
```

**⚠️ ユーザー名の推奨命名規則**:
- 開発者: `FullStack-[名前]-AI`
- テスター: `QA-[名前]-AI`
- 例: `FullStack-Kai-AI`, `QA-Mira-AI`

### Step 3: 認証プロセス
1. **パズル認証**: 表示される認証パズルを解く
2. **メール認証**: 
   - 登録メールに届く6桁のコードを入力
   - メールが届かない場合は迷惑メールフォルダ確認

### Step 4: プラン選択
- **Free プラン**を選択（無料で十分）
- 「Continue for free」をクリック

### Step 5: プロフィール設定
```yaml
表示名: Kai (FullStack Developer) または Mira (QA Engineer)
Bio: Vibey Technologies AI Team Member
会社: Vibey Technologies
場所: Tokyo, Japan
```

---

## 🔐 リポジトリへのアクセス権限取得

### 方法1: sparkさんに招待してもらう（推奨）

#### sparkさんへの依頼メッセージテンプレート
```
sparkさん、

GitHubアカウントを作成しました。
vibey-tech-managementリポジトリへのアクセス権限をお願いします。

アカウント情報:
- ユーザー名: @FullStack-Kai-AI
- メール: kai@vibey-tech.com
- 役割: 開発者/テスター

以下の権限が必要です：
- Issue作成・編集
- コメント投稿
- ラベル管理
- （開発者の場合）コード変更・PR作成

よろしくお願いします。
PM-Aiden
```

### 方法2: 招待リンク経由（sparkさんが送付）

1. sparkさんが招待リンクを送信
2. メールまたはGitHub通知で招待を受信
3. 「Accept invitation」をクリック
4. リポジトリアクセス完了

### 必要な権限レベル

#### 開発者（FullStack-Kai, FullStack-Noa）
- **Write権限**: コード変更・PR作成・Issue管理
- **設定場所**: Settings → Manage access → Add people

#### テスター（QA-Mira）
- **Triage権限**: Issue管理・ラベル変更（コード変更不可）
- **設定場所**: Settings → Manage access → Add people

---

## 🛠️ 初回セットアップ

### 1. Git設定（ローカル環境）

```bash
# ユーザー名設定
git config --global user.name "Kai (FullStack Developer)"
git config --global user.email "kai@vibey-tech.com"

# 認証情報保存（Windows）
git config --global credential.helper wincred
```

### 2. SSH鍵設定（オプション・推奨）

```bash
# SSH鍵生成
ssh-keygen -t ed25519 -C "kai@vibey-tech.com"

# 公開鍵をコピー
cat ~/.ssh/id_ed25519.pub

# GitHubに登録
# Settings → SSH and GPG keys → New SSH key
```

### 3. Personal Access Token作成（HTTPS利用時）

1. GitHub → Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token (classic)
4. 権限選択:
   ```
   ✅ repo (Full control of private repositories)
   ✅ workflow (Update GitHub Action workflows)
   ✅ write:discussion (Write discussion)
   ```
5. トークンをコピー・保存（再表示されません！）

### 4. 認証テスト

```bash
# HTTPS認証
git clone https://github.com/sparkminan/vibey-tech-management.git
# ユーザー名: GitHubユーザー名
# パスワード: Personal Access Token

# SSH認証
git clone git@github.com:sparkminan/vibey-tech-management.git
```

---

## 💬 Issue・コメント投稿方法

### 📋 Issue作成（バグレポート・タスク）

#### Webブラウザから
1. https://github.com/sparkminan/vibey-tech-management/issues
2. 「**New issue**」ボタンクリック
3. テンプレート選択または自由記述

#### Issue作成例（開発者）
```markdown
## [TASK] API レスポンス最適化

### 概要
Airtable API のレスポンスが3秒以上かかる問題の改善

### 現状
- 平均レスポンス時間: 3.2秒
- ボトルネック: データ変換処理

### 改善案
1. 並列処理実装
2. キャッシュ戦略見直し
3. データ構造最適化

### 期待結果
- レスポンス時間 < 1秒
- Lighthouse Performance 90+

ラベル: type/task, priority/high, area/performance
```

#### Issue作成例（テスター）
```markdown
## [BUG] モバイル表示でタイルが重なる

### バグ概要
iPhone Safari でタイルレイアウトが崩れる

### 再現手順
1. iPhone Safari でサイトアクセス
2. 画面を横向きに回転
3. 縦向きに戻す

### 期待される動作
タイルが整列して表示される

### 実際の動作
タイルが重なって表示される

### 環境
- デバイス: iPhone 13
- OS: iOS 17.5
- ブラウザ: Safari
- 再現率: 100%

### スクリーンショット
[画像添付]

ラベル: type/bug, priority/high, device/mobile
```

### 💭 コメント投稿

#### 進捗報告（開発者）
```markdown
## 進捗報告 - 2025/8/4

### ✅ 完了
- Airtable API 接続実装
- 基本的なデータ取得機能

### 🔄 進行中
- キャッシュレイヤー実装（60%完了）
- エラーハンドリング追加

### ⏭️ 次の作業
- パフォーマンステスト
- 本番環境デプロイ準備

進捗率: 45%
ブロッカー: なし
```

#### テスト結果報告（テスター）
```markdown
## テスト結果報告 - 機能テスト

### テスト概要
- テスト種別: 機能テスト
- 対象機能: Airtableデータ取得
- 実施日: 2025/8/8

### テスト結果
✅ **PASS** (8/10)
- データ取得: ✅
- フィルタリング: ✅
- ソート機能: ✅
- ページネーション: ✅
- エラーハンドリング: ✅
- キャッシュ動作: ✅
- 画像表示: ✅
- リンク動作: ✅

❌ **FAIL** (2/10)
- レスポンシブ表示: ❌ → Issue #125
- 日本語検索: ❌ → Issue #126

### 次のステップ
- 失敗項目の修正待ち
- 修正後の再テスト予定
```

### 🏷️ ラベル管理

権限があれば、Issueにラベルを追加：
- **開発ステータス**: `status/in-progress`, `status/review`
- **優先度**: `priority/critical`, `priority/high`
- **種別**: `type/bug`, `type/feature`, `type/task`
- **担当**: `assigned/kai`, `assigned/mira`

---

## 🚨 トラブルシューティング

### 問題1: 「Permission denied」エラー
**原因**: リポジトリアクセス権限なし  
**解決策**:
1. sparkさんに招待依頼
2. 招待メール/通知を確認
3. 「Accept invitation」クリック

### 問題2: Push できない
**原因**: Write権限不足  
**解決策**:
1. 権限確認: Settings → Access
2. sparkさんに権限昇格依頼
3. Personal Access Token再作成

### 問題3: Issue作成ボタンが表示されない
**原因**: Issues機能が無効  
**解決策**:
1. リポジトリ Settings → Features
2. 「Issues」にチェック
3. ページリロード

### 問題4: 認証が毎回要求される
**原因**: 認証情報未保存  
**解決策**:
```bash
# Windows
git config --global credential.helper wincred

# Mac
git config --global credential.helper osxkeychain

# Linux
git config --global credential.helper store
```

---

## 🤖 AIチーム専用設定

### プロフィール設定テンプレート

#### 開発者プロフィール
```yaml
Name: Kai / Noa
Bio: |
  🤖 AI Full-Stack Developer at Vibey Technologies
  💻 Specializing in Next.js, TypeScript, and API Integration
  🚀 Building high-performance web applications
Company: Vibey Technologies
Location: Tokyo, Japan
Website: https://vibey-tech.com
```

#### テスタープロフィール
```yaml
Name: Mira
Bio: |
  🧪 AI QA Engineer at Vibey Technologies
  🔍 Ensuring software quality through comprehensive testing
  📊 Specialized in performance and security testing
Company: Vibey Technologies
Location: Tokyo, Japan
```

### 自動化ツール設定

#### GitHub CLI エイリアス
```bash
# ~/.bashrc or ~/.zshrc に追加
alias gh-issues='gh issue list --repo sparkminan/vibey-tech-management'
alias gh-create='gh issue create --repo sparkminan/vibey-tech-management'
alias gh-comment='gh issue comment --repo sparkminan/vibey-tech-management'
```

#### VS Code 拡張機能
1. **GitHub Pull Requests and Issues**
2. **GitLens**
3. **GitHub Copilot** (開発者向け)

---

## 📞 サポート連絡先

### アカウント・権限関連
- **sparkさん**: リポジトリオーナー・権限付与
- **PM-Aiden**: 手順サポート・問題解決

### 技術的サポート
- **DevOps-Rex**: Git/GitHub設定支援
- **開発チーム**: ツール・自動化支援

### 連絡方法
1. Discord: #github-support
2. Issue: サポート依頼Issue作成
3. Email: support@vibey-tech.com

---

## 📋 チェックリスト

### アカウント作成完了チェック
- [ ] GitHubアカウント作成
- [ ] メール認証完了
- [ ] プロフィール設定
- [ ] sparkさんに招待依頼送信
- [ ] リポジトリアクセス確認

### 初回セットアップ完了チェック
- [ ] Git設定（名前・メール）
- [ ] 認証設定（SSH or Token）
- [ ] リポジトリクローン成功
- [ ] 最初のIssue作成
- [ ] 最初のコメント投稿

---

**🎉 GitHubアカウント設定が完了したら、チーム開発に参加できます！**

不明な点があれば、PM-Aidenまでお問い合わせください。