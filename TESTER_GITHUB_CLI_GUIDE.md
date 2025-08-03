# 🧪 テスター向け GitHub CLI 完全ガイド

**対象**: QA-Mira および全テスターチーム  
**更新日**: 2025年8月3日  
**作成者**: PM-Aiden  

---

## 📋 目次
1. [GitHub CLIとは](#-github-cliとは)
2. [インストール手順](#-インストール手順)
3. [初期設定・認証](#-初期設定認証)
4. [テスターが使うコマンド一覧](#-テスターが使うコマンド一覧)
5. [トラブルシューティング](#-トラブルシューティング)
6. [代替手段（GitHub CLI不要）](#-代替手段github-cli不要)

---

## 🔧 GitHub CLIとは

GitHub CLIは、コマンドラインからGitHubを操作できる公式ツールです。テスターは以下の作業で活用できます：
- Issue作成・更新・コメント追加
- バグレポート投稿
- テスト結果報告
- 進捗ステータス更新

---

## 📥 インストール手順

### Windows版インストール

#### 方法1: 公式インストーラー使用（推奨）
1. **ダウンロード**: https://cli.github.com/ から最新版をダウンロード
2. **実行**: ダウンロードした `gh_*_windows_amd64.msi` をダブルクリック
3. **インストール**: ウィザードに従って「Next」→「Install」→「Finish」

#### 方法2: Chocolatey使用
```powershell
# 管理者権限のPowerShellで実行
choco install gh -y
```

#### 方法3: 手動ダウンロード
```powershell
# PowerShellで実行
curl -L -o "$env:TEMP\gh-installer.msi" "https://github.com/cli/cli/releases/latest/download/gh_2.76.2_windows_amd64.msi"
msiexec /i "$env:TEMP\gh-installer.msi"
```

### インストール確認
```powershell
# 新しいPowerShell/コマンドプロンプトを開いて実行
gh --version
```

**期待される出力**:
```
gh version 2.76.2 (2025-07-30)
https://github.com/cli/cli/releases/tag/v2.76.2
```

---

## 🔐 初期設定・認証

### 1. GitHub認証（Webブラウザ使用）
```powershell
gh auth login --web
```

**手順**:
1. コマンド実行後、Enterキーを押す
2. 表示されたコードをコピー
3. ブラウザが開いたらコードを貼り付け
4. GitHubアカウントでログイン・承認

### 2. トークン認証（Personal Access Token使用）
```powershell
# トークンをお持ちの場合
echo YOUR_GITHUB_TOKEN | gh auth login --with-token
```

### 3. 認証状態確認
```powershell
gh auth status
```

**成功時の出力例**:
```
github.com
  ✓ Logged in to github.com as sparkminan
  ✓ Git operations for github.com configured to use https protocol
  ✓ Token: ghp_****
```

---

## 🧪 テスターが使うコマンド一覧

### 📋 Issue操作

#### 1. Issue一覧表示
```powershell
# プロジェクトの全Issue確認
gh issue list --repo sparkminan/vibey-tech-management

# バグ関連のIssueのみ表示
gh issue list --repo sparkminan/vibey-tech-management --label "type/bug"

# 自分がアサインされたIssue表示
gh issue list --repo sparkminan/vibey-tech-management --assignee @me
```

#### 2. Issue詳細確認
```powershell
# Issue番号を指定して詳細表示
gh issue view 7 --repo sparkminan/vibey-tech-management

# Webブラウザで開く
gh issue view 7 --repo sparkminan/vibey-tech-management --web
```

#### 3. バグレポート作成
```powershell
# 新しいバグレポートを作成
gh issue create --repo sparkminan/vibey-tech-management \
  --title "[BUG] ページ読み込みエラー" \
  --body "## バグ概要
ページ読み込み時にエラーが発生

## 再現手順
1. トップページにアクセス
2. リロードボタンをクリック

## 期待される動作
正常に再読み込み

## 実際の動作
500エラー表示

## 環境
- ブラウザ: Chrome 120
- OS: Windows 11" \
  --label "type/bug,priority/high"
```

#### 4. テスト結果報告（コメント追加）
```powershell
# Issue #7 にテスト結果を報告
gh issue comment 7 --repo sparkminan/vibey-tech-management \
  --body "## テスト結果報告

### ✅ 完了したテスト
- 機能テスト: 10/10 パス
- パフォーマンステスト: Lighthouse 92点達成
- セキュリティテスト: 脆弱性0件

### ❌ 発見した問題
- Issue #123: モバイル表示崩れ
- Issue #124: API遅延（3秒以上）

### 📊 テストカバレッジ
- 全体: 87%
- 重要機能: 95%

次のステップ: 発見した問題の修正待ち"
```

#### 5. ステータス更新
```powershell
# Issue #7 のラベルを更新（テスト中）
gh issue edit 7 --repo sparkminan/vibey-tech-management \
  --add-label "status/testing"

# テスト完了後
gh issue edit 7 --repo sparkminan/vibey-tech-management \
  --add-label "status/tested" \
  --remove-label "status/testing"
```

### 📊 テスト進捗管理

#### 1. テスト対象Issue一覧
```powershell
# テスト必要なIssue表示
gh issue list --repo sparkminan/vibey-tech-management \
  --label "needs-testing" \
  --json number,title,assignees
```

#### 2. バグ統計確認
```powershell
# オープンなバグ数確認
gh issue list --repo sparkminan/vibey-tech-management \
  --label "type/bug" \
  --state open \
  --json number,title,severity | jq length
```

### 🎯 便利なエイリアス設定

PowerShellプロファイルに追加すると便利：
```powershell
# プロファイル編集
notepad $PROFILE

# 以下を追加
function Test-Issue { gh issue list --repo sparkminan/vibey-tech-management --label "needs-testing" }
function Bug-List { gh issue list --repo sparkminan/vibey-tech-management --label "type/bug" }
function Test-Report { 
    param($issueNumber, $result)
    gh issue comment $issueNumber --repo sparkminan/vibey-tech-management --body $result
}
```

---

## 🚨 トラブルシューティング

### 問題1: "gh: command not found"
**原因**: PATHが通っていない  
**解決方法**:
1. 新しいPowerShell/コマンドプロンプトを開く
2. それでもダメなら、フルパスで実行:
   ```powershell
   "C:\Program Files\GitHub CLI\gh.exe" --version
   ```

### 問題2: "Authentication required"
**原因**: 未認証状態  
**解決方法**:
```powershell
gh auth login --web
```

### 問題3: "Permission denied"
**原因**: トークンの権限不足  
**解決方法**:
1. 新しいトークンを作成（必要な権限: repo, read:org）
2. 再認証:
   ```powershell
   gh auth logout
   gh auth login --web
   ```

### 問題4: "Rate limit exceeded"
**原因**: API制限に到達  
**解決方法**:
- 1時間待つ
- または認証済みアカウントを使用（制限緩和）

---

## 🔄 代替手段（GitHub CLI不要）

### 方法1: Webブラウザ使用
1. https://github.com/sparkminan/vibey-tech-management/issues
2. 「New issue」ボタンからバグレポート作成
3. コメント欄でテスト結果報告

### 方法2: npmスクリプト使用
```bash
# プロジェクトディレクトリで実行
cd vibey-tech-management

# Issue作成スクリプト（開発チーム提供）
npm run create-bug-report

# テスト結果報告
npm run test-report
```

### 方法3: VS Code拡張機能
1. VS Code拡張機能「GitHub Pull Requests and Issues」インストール
2. サイドバーからIssue操作可能

---

## 📚 参考リンク

- **GitHub CLI公式ドキュメント**: https://cli.github.com/manual/
- **GitHub CLI日本語ガイド**: https://docs.github.com/ja/github-cli
- **Vibey Tech Issues**: https://github.com/sparkminan/vibey-tech-management/issues
- **バグレポートテンプレート**: https://github.com/sparkminan/vibey-tech-management/blob/main/.github/ISSUE_TEMPLATE/bug_report.md

---

## 🆘 サポート連絡先

### GitHub CLI技術サポート
- **PM-Aiden**: プロジェクト管理・全般サポート
- **DevOps-Rex**: インストール・環境設定支援
- **開発チーム**: スクリプト・自動化ツール提供

### 緊急時連絡
- Discord: #tech-support チャンネル
- Email: support@vibey-tech.com

---

## 📝 QA-Mira専用コマンドセット

テスト責任者として頻繁に使うコマンド集：

```powershell
# 本日のテスト対象確認
gh issue list --repo sparkminan/vibey-tech-management \
  --label "needs-testing,priority/critical" \
  --assignee QA-Mira

# バグサマリー生成
gh issue list --repo sparkminan/vibey-tech-management \
  --label "type/bug" \
  --state all \
  --json number,title,state,createdAt \
  --jq '.[] | "\(.number)\t\(.state)\t\(.title)"' > bug-report.txt

# 週次品質レポート用データ取得
gh api graphql -f query='
  query {
    repository(owner: "sparkminan", name: "vibey-tech-management") {
      issues(labels: ["type/bug"], first: 100) {
        totalCount
        nodes {
          number
          title
          state
          createdAt
          closedAt
        }
      }
    }
  }
' > weekly-quality-report.json
```

---

**⚠️ 重要**: QA-Miraは品質確認・テスト実行・バグ報告専門です。コード修正や実装は絶対に行わないでください。

**このガイドで不明な点があれば、PM-Aidenまでお問い合わせください！** 🚀