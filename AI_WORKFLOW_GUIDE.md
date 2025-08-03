# AI開発者向けワークフローガイド

## 🤖 概要
このガイドは、Claude Code AIが効率的にGitHub Issues/Projectsを使用して開発を進めるための手順書です。

## 📋 作業開始前の準備

### 1. GitHub CLIのセットアップ
```bash
# GitHub CLI のインストール確認
gh --version

# 認証
gh auth login

# 認証状態の確認
gh auth status
```

### 2. 作業可能なIssueの確認
```bash
# 開発準備完了のIssueを確認
gh issue list --label "status: ready-for-dev" --json number,title,labels,assignees

# 特定のプロジェクトのみ
gh issue list --repo sparkminan/claude-code-remote --label "status: ready-for-dev"

# 優先度高のIssueを確認
gh issue list --label "priority: high" --label "status: ready-for-dev"
```

## 🔄 開発ワークフロー

### Step 1: Issueの選択とアサイン
```bash
# Issue詳細を確認
gh issue view 123

# 自分にアサイン
gh issue edit 123 --add-assignee "@me"

# ステータスラベルを更新
gh issue edit 123 --remove-label "status: ready-for-dev" --add-label "status: in-progress"
```

### Step 2: ブランチ作成
```bash
# Issue番号を含むブランチを作成
git checkout -b feature/issue-123-websocket-implementation

# または、GitHub CLIで作成
gh issue develop 123 --checkout
```

### Step 3: 開発作業

#### コミットメッセージ規約
```bash
# 形式: type(scope): description #issue-number

# 例：
git commit -m "feat(websocket): implement connection handler #123"
git commit -m "fix(auth): resolve token validation error #124"
git commit -m "docs(api): update WebSocket endpoint documentation #125"
```

#### タイプ一覧
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: フォーマット変更
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: ビルドプロセスやツールの変更

### Step 4: 進捗の更新
```bash
# Issue にコメントを追加
gh issue comment 123 --body "WebSocket基本実装完了。現在テスト作成中。進捗: 60%"

# チェックリストの更新（Issue本文を編集）
gh issue edit 123 --body "$(gh issue view 123 --json body -q .body | sed 's/\[ \] WebSocket実装/\[x\] WebSocket実装/')"
```

### Step 5: Pull Request作成
```bash
# PRを作成（Issueと自動リンク）
gh pr create \
  --title "feat: WebSocket connection implementation" \
  --body "## 概要
WebSocket接続機能を実装しました。

## 変更内容
- WebSocketサーバーの実装
- クライアント側の接続ロジック
- 自動再接続機能

## テスト
- [x] ユニットテスト追加
- [x] 統合テスト実施
- [x] 手動テスト完了

Closes #123" \
  --label "type: feature"

# ドラフトPRとして作成
gh pr create --draft --title "WIP: WebSocket implementation #123"
```

### Step 6: レビュー対応
```bash
# レビューコメントを確認
gh pr view --comments

# レビュー修正後
git add .
git commit -m "fix: address review comments #123"
git push

# PRにコメント
gh pr comment --body "レビューコメントに対応しました。再度ご確認ください。"
```

### Step 7: マージとクリーンアップ
```bash
# PRがマージされた後
git checkout main
git pull origin main
git branch -d feature/issue-123-websocket-implementation

# リモートブランチも削除
git push origin --delete feature/issue-123-websocket-implementation
```

## 📊 プロジェクトボードの操作

### カード（Issue）の移動
```bash
# プロジェクトボードのカラムIDを確認
gh project list

# IssueをIn Progressに移動
gh project item-add 1 --owner sparkminan --url https://github.com/sparkminan/repo/issues/123

# ステータスを更新
gh api graphql -f query='
  mutation {
    updateProjectV2ItemFieldValue(
      input: {
        projectId: "PROJECT_ID"
        itemId: "ITEM_ID"
        fieldId: "FIELD_ID"
        value: { singleSelectOptionId: "OPTION_ID" }
      }
    ) {
      projectV2Item {
        id
      }
    }
  }
'
```

## 🔍 便利なクエリ集

### 自分のタスク確認
```bash
# 自分にアサインされたIssue
gh issue list --assignee @me --state open

# 自分が作成したPR
gh pr list --author @me

# レビュー待ちのPR
gh pr list --search "is:pr is:open review-requested:@me"
```

### プロジェクト状況確認
```bash
# 今週作成されたIssue
gh issue list --search "created:>$(date -d '7 days ago' +%Y-%m-%d)"

# ブロックされているIssue
gh issue list --label "status: blocked"

# 期限切れのIssue
gh issue list --search "is:open label:has-deadline"
```

## 📝 ドキュメント更新

### Issue/PR作成時の自動通知
```yaml
# .github/workflows/notify.yml
name: Notify on Issue/PR
on:
  issues:
    types: [opened, closed]
  pull_request:
    types: [opened, closed, merged]

jobs:
  notify:
    runs-on: ubuntu-latest
    steps:
      - name: Send notification
        run: |
          echo "Issue/PR updated: ${{ github.event.issue.title || github.event.pull_request.title }}"
```

## ⚠️ 注意事項

1. **並行作業の防止**
   - 他のAIが作業中のIssueには触らない
   - `assignees`フィールドを必ず確認

2. **ブランチ戦略**
   - 常に最新のmainブランチから作成
   - 1つのIssueに1つのブランチ

3. **コミュニケーション**
   - 重要な決定はIssueにコメントとして記録
   - ブロッカーは即座に報告

4. **品質管理**
   - PRを出す前に必ずテストを実行
   - コードレビューのフィードバックに迅速に対応

## 🚀 効率化のヒント

1. **エイリアス設定**
```bash
# ~/.bashrc or ~/.zshrc
alias gi="gh issue"
alias gpr="gh pr"
alias gis="gh issue list --label 'status: ready-for-dev'"
```

2. **テンプレート活用**
   - Issue/PRテンプレートを使用して一貫性を保つ

3. **自動化**
   - 繰り返しタスクはGitHub Actionsで自動化

---
このガイドに従って、効率的にGitHub上で開発を進めてください。