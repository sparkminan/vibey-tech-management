# 開発者ワークフローガイド

## 📋 タスクの確認と選択

### 1. GitHub Issuesの確認
各プロジェクトのIssuesページで作業可能なタスクを確認：
- [Claude Code Remote Issues](https://github.com/sparkminan/claude-code-remote/issues)
- [HENKAKU AI Archive Issues](https://github.com/sparkminan/henkaku-ai-archive/issues)

### 2. タスク選択の優先順位
1. **Critical** ラベルのついたバグ
2. **High Priority** ラベルのタスク
3. **ready-for-dev** ラベルのタスク
4. 自分の専門分野に関連するタスク

### 3. タスクのアサイン
- 自分でアサインするか、PMに確認
- 同時に複数のタスクを抱えすぎない（最大2-3個）

## 🔄 開発フロー

### 1. ブランチ作成
```bash
# フィーチャーブランチ
git checkout -b feature/issue-{番号}-{簡潔な説明}
# 例: git checkout -b feature/issue-23-add-caching-layer

# バグ修正ブランチ
git checkout -b bugfix/issue-{番号}-{簡潔な説明}
# 例: git checkout -b bugfix/issue-45-fix-api-limit
```

### 2. 開発作業
1. **コーディング規約の確認**
   - 各プロジェクトのREADMEとCONTRIBUTING.mdを参照
   - ESLint/Prettierの設定に従う

2. **定期的なコミット**
   ```bash
   git add .
   git commit -m "feat: 機能の説明 #issue番号"
   # 例: git commit -m "feat: Add Redis caching layer #23"
   ```

3. **テストの実行**
   ```bash
   npm test
   npm run lint
   ```

### 3. Pull Request作成

#### PRタイトル
```
[Issue #番号] タスクの概要
例: [Issue #23] Add caching layer for Airtable API
```

#### PR本文テンプレート
```markdown
## 概要
このPRで実装した内容の概要

## 関連Issue
Closes #番号

## 変更内容
- [ ] 変更点1
- [ ] 変更点2
- [ ] 変更点3

## テスト方法
1. 手順1
2. 手順2
3. 手順3

## スクリーンショット（UI変更の場合）
変更前:
変更後:

## チェックリスト
- [ ] コードはプロジェクトのスタイルガイドに従っている
- [ ] セルフレビューを実施した
- [ ] コメントを追加した（特に複雑なロジックの部分）
- [ ] ドキュメントを更新した（必要な場合）
- [ ] テストを追加/更新した
- [ ] すべてのテストがパスしている
- [ ] 新たな警告が発生していない
```

### 4. レビュー対応
- レビューコメントには24時間以内に対応
- 修正は新しいコミットで追加
- すべての指摘事項が解決したらレビュアーに再確認を依頼

## 📝 ステータス更新

### Issue進捗の更新
定期的にIssueにコメントを追加：
- 作業開始時
- 大きな進捗があった時
- ブロッカーが発生した時
- 完了時

### 例：
```markdown
作業を開始しました。まずはキャッシング戦略の設計から始めます。

---

Redisの実装が完了しました。次はAirtable APIとの統合部分を実装します。
進捗: 60%

---

テスト中にエッジケースを発見しました。修正に追加で2時間ほど必要です。
```

## 🚨 トラブルシューティング

### ブロッカーが発生した場合
1. Issueにコメントで状況を報告
2. **blocked** ラベルを追加
3. PMまたは他の開発者に相談
4. 代替案を検討

### 見積もりを大幅に超過しそうな場合
1. 早めにIssueで報告
2. 原因と対策を説明
3. 新しい見積もりを提示

## 🎯 ベストプラクティス

### コード品質
- DRY原則を守る
- 単一責任の原則を意識
- わかりやすい変数名・関数名
- 適切なエラーハンドリング

### コミュニケーション
- 不明点は早めに質問
- 進捗は定期的に共有
- レビューは建設的に

### ドキュメント
- 新機能には必ずドキュメントを追加
- APIの変更はすぐに反映
- 設定変更は.env.exampleも更新

## 🔗 便利なリンク

### プロジェクト管理
- [マスターダッシュボード](./dashboards/MASTER_DASHBOARD.md)
- [Claude Code Remote バックログ](./backlogs/claude-code-remote-backlog.md)
- [HENKAKU AI Archive バックログ](./backlogs/henkaku-ai-archive-backlog.md)

### 技術ドキュメント
- [GitHub統合ガイド](./GITHUB_INTEGRATION_GUIDE.md)
- [AI開発者向けガイド](./AI_WORKFLOW_GUIDE.md)

### プロジェクト固有
- Claude Code Remote: [DEVELOPER_GUIDE.md](../claude-code-remote/DEVELOPER_GUIDE.md)
- HENKAKU AI Archive: [CONTRIBUTING.md](../Documents/henkaku-ai-archive/CONTRIBUTING.md)

---

*質問がある場合は、GitHubのDiscussionsまたはIssueで気軽に聞いてください。*