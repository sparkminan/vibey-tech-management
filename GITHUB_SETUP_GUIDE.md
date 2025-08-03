# GitHub統合管理セットアップガイド

**実行者**: sparkさん  
**実行時期**: 2025年8月3日-10日  
**前提**: GitHub Proアカウント推奨

---

## 🚀 クイックスタート（30分で基本構築）

### Step 1: Organization作成（5分）
```markdown
1. GitHub.com → 右上「+」→「New organization」
2. Organization name: vibey-technologies
3. Contact email: your-email@example.com
4. Plan: Free (後でProにアップグレード可能)
```

### Step 2: メイン管理リポジトリ作成（5分）
```markdown
1. Organization内で「New repository」
2. Repository name: vibey-tech-management  
3. Visibility: Private ✅
4. Initialize with README: ✅
5. Add .gitignore: None
6. Choose a license: MIT
```

### Step 3: 基本構造作成（20分）
以下のフォルダ・ファイルを作成：

```
vibey-tech-management/
├── projects/
│   ├── claude-code-remote/
│   └── henkaku-ai-archive/
├── templates/
├── knowledge-base/
├── dashboards/
├── automation/
└── .github/
    ├── workflows/
    └── ISSUE_TEMPLATE/
```

---

## 📋 詳細セットアップ手順

### Phase 1: リポジトリ基盤構築

#### 1-1. 既存プロジェクトの組織移管

```bash
# 既存リポジトリをOrganizationに移管
1. 各リポジトリの Settings
2. Scroll down to "Danger Zone"
3. "Transfer ownership"
4. New owner: vibey-technologies
5. Repository name: そのまま
```

#### 1-2. 管理リポジトリの初期構造

```bash
# ローカルでクローン
git clone https://github.com/vibey-technologies/vibey-tech-management.git
cd vibey-tech-management

# 基本構造作成
mkdir -p projects/{claude-code-remote,henkaku-ai-archive}
mkdir -p templates knowledge-base dashboards automation
mkdir -p .github/{workflows,ISSUE_TEMPLATE}

# 既存ドキュメントのコピー
cp ../vibey-tech-management/* ./knowledge-base/
```

#### 1-3. Issue テンプレート作成

```markdown
# .github/ISSUE_TEMPLATE/epic.md
---
name: エピック
about: 大きな機能単位の管理
title: '[EPIC] '
labels: 'type/epic'
assignees: ''
---

## エピック概要


## 背景・目的


## 受け入れ条件
- [ ] 
- [ ] 

## 関連ストーリー
- #
- #

## 見積もり・期限
- 工数: 
- 期限: 
```

### Phase 2: GitHub Projects設定

#### 2-1. Organization Projects作成

```markdown
手順:
1. Organization → Projects タブ
2. "New project" → "Board"
3. Project name: "Vibey Tech Master Board"
4. Description: "全プロジェクト統括管理ボード"
5. Visibility: Private
```

#### 2-2. カスタムフィールド設定

```markdown
Custom Fields設定:
1. Settings → Fields → "New field"

Project (Single select):
- Claude Code Remote
- HENKAKU AI Archive  
- Cross-project

Priority (Single select):
- 🔴 Critical
- 🟠 High
- 🟡 Medium
- 🟢 Low

Epic (Text):
- Placeholder: "関連エピック名"

Effort (Number):
- Description: "見積もり工数（時間）"

Business Value (Single select):
- High
- Medium
- Low

Risk Level (Single select):
- High
- Medium
- Low

Quality Score (Number):
- Description: "品質スコア（0-100）"
```

#### 2-3. ビュー設定

```markdown
ビュー作成:
1. "New view" → 各種ビューを作成

📊 "Overview" (Board):
- Group by: Status
- Sort by: Priority (High to Low)

📅 "Timeline" (Timeline):
- Date field: Due date
- Group by: Project

👥 "By Assignee" (Table):
- Group by: Assignees
- Show: All fields

🎯 "High Priority" (Table):
- Filter: Priority = Critical OR High
- Sort by: Due date

📈 "Quality Dashboard" (Table):
- Filter: Quality Score > 0
- Sort by: Quality Score (Low to High)
```

### Phase 3: 自動化設定

#### 3-1. Issue同期ワークフロー

```yaml
# .github/workflows/sync-issues.yml
name: Cross-Project Issue Sync

on:
  issues:
    types: [opened, labeled, assigned, closed]

jobs:
  sync-to-project:
    runs-on: ubuntu-latest
    if: contains(github.event.issue.labels.*.name, 'project/')
    
    steps:
      - uses: actions/add-to-project@v0.4.0
        with:
          project-url: https://github.com/orgs/vibey-technologies/projects/1
          github-token: ${{ secrets.PROJECT_TOKEN }}
          
      - name: Set project fields
        uses: actions/github-script@v7
        with:
          github-token: ${{ secrets.PROJECT_TOKEN }}
          script: |
            // プロジェクトラベルに基づいてProjectフィールドを設定
            const labels = context.payload.issue.labels.map(l => l.name);
            const projectLabel = labels.find(l => l.startsWith('project/'));
            
            if (projectLabel) {
              const projectName = projectLabel.replace('project/', '');
              // GitHub GraphQL APIでプロジェクトフィールドを更新
            }
```

#### 3-2. 日次メトリクス収集

```yaml
# .github/workflows/daily-metrics.yml
name: Daily Metrics Collection

on:
  schedule:
    - cron: '0 18 * * *'  # 毎日18:00 JST

jobs:
  collect-metrics:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install @octokit/rest
        
      - name: Collect metrics
        run: node automation/metrics-collector.js
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Update dashboard
        run: |
          # メトリクスをダッシュボードファイルに反映
          node automation/dashboard-updater.js
          
      - name: Commit updates
        run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git add dashboards/
          git commit -m "📊 Daily metrics update" || exit 0
          git push
```

#### 3-3. 週次レポート生成

```yaml
# .github/workflows/weekly-report.yml
name: Weekly PM Report

on:
  schedule:
    - cron: '0 9 * * 1'  # 毎週月曜9:00

jobs:
  generate-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Generate weekly report
        run: node automation/weekly-report-generator.js
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          
      - name: Create issue with report
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const report = fs.readFileSync('reports/weekly-report.md', 'utf8');
            
            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `📊 週次レポート - ${new Date().toISOString().split('T')[0]}`,
              body: report,
              labels: ['type/report', 'priority/medium']
            });
```

---

## 🔧 実装サポートスクリプト

### automation/metrics-collector.js

```javascript
const { Octokit } = require('@octokit/rest');

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

async function collectMetrics() {
  const repos = ['claude-code-remote', 'henkaku-ai-archive'];
  const metrics = {};
  
  for (const repo of repos) {
    // Issues統計
    const { data: issues } = await octokit.rest.issues.listForRepo({
      owner: 'vibey-technologies',
      repo: repo,
      state: 'all',
      per_page: 100
    });
    
    // PRs統計
    const { data: prs } = await octokit.rest.pulls.list({
      owner: 'vibey-technologies',
      repo: repo,
      state: 'all',
      per_page: 100
    });
    
    metrics[repo] = {
      openIssues: issues.filter(i => i.state === 'open' && !i.pull_request).length,
      closedIssues: issues.filter(i => i.state === 'closed' && !i.pull_request).length,
      openPRs: prs.filter(pr => pr.state === 'open').length,
      mergedPRs: prs.filter(pr => pr.merged_at).length,
      lastActivity: new Date().toISOString()
    };
  }
  
  // メトリクスをファイル出力
  require('fs').writeFileSync(
    'dashboards/metrics.json', 
    JSON.stringify(metrics, null, 2)
  );
  
  console.log('Metrics collected:', metrics);
}

collectMetrics().catch(console.error);
```

### automation/dashboard-updater.js

```javascript
const fs = require('fs');

function updateDashboard() {
  const metrics = JSON.parse(fs.readFileSync('dashboards/metrics.json', 'utf8'));
  
  const dashboard = `# Master Dashboard

最終更新: ${new Date().toLocaleString('ja-JP')}

## 📊 プロジェクト概要

${Object.entries(metrics).map(([project, data]) => `
### ${project}
- 📝 オープンIssues: ${data.openIssues}
- ✅ クローズIssues: ${data.closedIssues}  
- 🔀 オープンPRs: ${data.openPRs}
- ✅ マージ済みPRs: ${data.mergedPRs}
`).join('')}

## 🎯 今週のハイライト

*自動生成されたメトリクスダッシュボード*
`;

  fs.writeFileSync('dashboards/MASTER_DASHBOARD.md', dashboard);
  console.log('Dashboard updated');
}

updateDashboard();
```

---

## 📱 GitHub Mobile活用

### スマートフォンでの管理

```markdown
GitHub Mobile Setup:
1. App Store/Google Play → "GitHub"をインストール
2. ログイン → Organizationアクセス確認
3. Push通知設定 → Issues, PRs, Mentionsを有効

活用シーン:
- 移動中のIssue確認・コメント
- 緊急Issue対応の承認
- 簡単なレビューやコメント
- プロジェクト進捗の確認
```

---

## 🔒 セキュリティ設定

### 1. Personal Access Token作成

```markdown
手順:
1. GitHub Settings → Developer settings
2. Personal access tokens → Tokens (classic)
3. Generate new token → Classic
4. Scopes選択:
   ✅ repo (Full control)
   ✅ project (Project access)
   ✅ read:org (Organization read)
   ✅ workflow (Workflow)

5. 生成されたトークンを安全に保存
```

### 2. Repository Secrets設定

```markdown
各リポジトリで設定:
1. Repository → Settings → Secrets and variables
2. Actions → New repository secret

設定するSecrets:
- PROJECT_TOKEN: 上記で作成したPAT
- SLACK_WEBHOOK: Slack通知用（オプション）
- EMAIL_SETTINGS: メール通知用（オプション）
```

### 3. Branch Protection Rules

```markdown
主要ブランチの保護:
1. Repository → Settings → Branches
2. Add rule → Branch name pattern: main
3. 設定項目:
   ✅ Require pull request reviews before merging
   ✅ Require status checks to pass before merging
   ✅ Require branches to be up to date before merging
   ✅ Include administrators
```

---

## 📊 運用開始チェックリスト

### セットアップ完了確認

#### Phase 1: 基盤構築
- [ ] Organization作成完了
- [ ] vibey-tech-management リポジトリ作成
- [ ] 基本ディレクトリ構造作成
- [ ] Issue テンプレート設定
- [ ] 既存プロジェクトの移管

#### Phase 2: Projects設定
- [ ] Master Project Board作成
- [ ] カスタムフィールド設定
- [ ] ビュー設定（5種類）
- [ ] ラベル体系統一
- [ ] プロジェクト専用ボード作成

#### Phase 3: 自動化実装
- [ ] Issue同期ワークフロー
- [ ] 日次メトリクス収集
- [ ] 週次レポート生成
- [ ] Personal Access Token設定
- [ ] Repository Secrets設定

#### Phase 4: セキュリティ・アクセス管理
- [ ] Branch Protection Rules設定
- [ ] アクセス権限設定
- [ ] セキュリティスキャン有効化
- [ ] 依存関係監視設定

### 運用開始準備
- [ ] チームメンバーへのアクセス権付与
- [ ] 操作マニュアル共有
- [ ] 初回トレーニング実施
- [ ] 運用ルール確立・共有

---

## 🎯 初期運用（最初の2週間）

### Week 1: データ移行・設定調整
```markdown
Day 1-3: 既存データ移行
- 現在のプロジェクト情報をIssueとして登録
- バックログをProject Boardに移行
- ドキュメントをknowledge-baseに整理

Day 4-7: 運用テスト
- 実際のIssue作成・管理フロー確認
- 自動化ワークフローのテスト
- ダッシュボード表示確認
```

### Week 2: チーム教育・本格運用開始
```markdown
Day 8-10: チーム教育
- 基本操作説明（Issue作成、Project使用）
- ラベル・フィールド活用方法
- 自動化機能の説明

Day 11-14: 本格運用開始
- 日次操作での運用確認
- 問題点の収集・改善
- 運用ルールの調整
```

---

## 📈 効果測定・KPI

### 設定すべきKPI

```markdown
効率性指標:
- Issue作成〜完了までの平均時間
- PR作成〜マージまでの平均時間  
- 週次レポート作成時間（自動化前後比較）

品質指標:
- Issue重複率
- バックログ管理精度
- プロジェクト期限遵守率

チーム満足度:
- プロジェクト管理ツール満足度アンケート
- 情報共有の改善実感
- 作業効率向上の実感
```

### 測定方法

```markdown
月次レビュー:
- GitHub Insights活用
- カスタムダッシュボードでのメトリクス確認
- チームフィードバック収集

四半期評価:
- ROI計算（時間削減効果）
- プロセス改善効果測定
- 次期改善計画の策定
```

---

**このガイドに従って段階的に実装することで、効率的で拡張性の高いGitHubプロジェクト管理体系を構築できます。不明点があれば、GitHubのDocumentationやCommunity Forumも活用してください。**