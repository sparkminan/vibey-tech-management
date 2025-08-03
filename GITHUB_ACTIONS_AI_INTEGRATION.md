# GitHub Actions × AI統合 運用設計書

**対象**: sparkさん・開発チーム  
**目的**: GitHub駆動でAI開発チームを自動起動する仕組み構築  
**作成日**: 2025年8月3日

---

## 🎯 基本コンセプト

### GitHub Issues → AI自動起動 → 作業完了
```
Issue作成 → PM-Aiden起動 → タスク分解 → 担当AI起動 → 作業実行 → 結果報告
```

---

## 🏷 AIラベル体系

### AI担当者ラベル
```yaml
# AI メンバーラベル
ai/pm-aiden          # PM-Aiden担当
ai/fullstack-kai     # FullStack-Kai担当  
ai/fullstack-noa     # FullStack-Noa担当
ai/qa-mira          # QA-Mira担当
ai/security-zane    # Security-Zane担当
ai/ui-luna          # UI-Luna担当
ai/devops-rex       # DevOps-Rex担当

# 自動化トリガーラベル
automation/ai-task    # AI自動処理対象
automation/manual     # 手動処理
automation/review     # レビュー必要
```

---

## 🤖 GitHub Actions ワークフロー設計

### 1. メインオーケストレーター (`pm-aiden-orchestrator.yml`)

```yaml
name: PM-Aiden Orchestrator
on:
  issues:
    types: [opened, labeled, edited]
  issue_comment:
    types: [created]

jobs:
  pm-aiden-triage:
    runs-on: ubuntu-latest
    if: contains(github.event.issue.labels.*.name, 'automation/ai-task')
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Setup Claude API
      env:
        CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}
      run: |
        # Claude API設定
        
    - name: PM-Aiden Analysis
      id: analysis
      run: |
        # PM-Aiden初期プロンプト + Issue内容をClaude APIに送信
        # 出力: 担当AI決定、タスク分解、優先度設定
        python scripts/pm-aiden-analysis.py \
          --issue-number ${{ github.event.issue.number }} \
          --issue-body "${{ github.event.issue.body }}" \
          --issue-title "${{ github.event.issue.title }}"
          
    - name: Update Issue Labels
      uses: actions/github-script@v7
      with:
        script: |
          // PM-Aidenの分析結果に基づいてラベル更新
          const analysis = JSON.parse('${{ steps.analysis.outputs.result }}');
          
          await github.rest.issues.addLabels({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: context.issue.number,
            labels: analysis.recommended_labels
          });
          
    - name: Create Sub-tasks
      run: |
        # PM-Aidenがタスク分解した結果を子Issueとして作成
        python scripts/create-subtasks.py \
          --parent-issue ${{ github.event.issue.number }} \
          --analysis '${{ steps.analysis.outputs.result }}'
          
    - name: Trigger Specialist AI
      run: |
        # 担当AI別のワークフローを起動
        python scripts/trigger-specialist.py \
          --specialist '${{ steps.analysis.outputs.assigned_ai }}' \
          --issue-number ${{ github.event.issue.number }}
```

### 2. 開発者AI (`fullstack-developer.yml`)

```yaml
name: FullStack Developer AI
on:
  workflow_dispatch:
    inputs:
      issue_number:
        required: true
      assigned_ai:
        required: true

jobs:
  fullstack-development:
    runs-on: ubuntu-latest
    if: ${{ github.event.inputs.assigned_ai == 'fullstack-kai' || github.event.inputs.assigned_ai == 'fullstack-noa' }}
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Load AI Character
      id: character
      run: |
        # 担当AIの初期プロンプトを読み込み
        if [ "${{ github.event.inputs.assigned_ai }}" == "fullstack-kai" ]; then
          echo "character_prompt=$(cat AI_CHARACTER_INITIAL_PROMPTS.md | sed -n '/# FullStack-Kai/,/# FullStack-Noa/p' | head -n -1)" >> $GITHUB_OUTPUT
        else
          echo "character_prompt=$(cat AI_CHARACTER_INITIAL_PROMPTS.md | sed -n '/# FullStack-Noa/,/# QA-Mira/p' | head -n -1)" >> $GITHUB_OUTPUT
        fi
        
    - name: Analyze Issue
      id: analysis
      env:
        CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}
      run: |
        # AIキャラクター + Issue内容 + 開発指示をClaude APIに送信
        python scripts/fullstack-analysis.py \
          --character-prompt "${{ steps.character.outputs.character_prompt }}" \
          --issue-number ${{ github.event.inputs.issue_number }} \
          --action "analyze and create implementation plan"
          
    - name: Generate Code
      id: generate
      run: |
        # 実装計画に基づいてコード生成
        python scripts/code-generator.py \
          --implementation-plan '${{ steps.analysis.outputs.plan }}' \
          --character "${{ github.event.inputs.assigned_ai }}"
          
    - name: Create Pull Request
      uses: peter-evans/create-pull-request@v5
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        commit-message: |
          ${{ github.event.inputs.assigned_ai }}: ${{ steps.analysis.outputs.commit_message }}
          
          Resolves #${{ github.event.inputs.issue_number }}
          
          🤖 Generated with [Claude Code](https://claude.ai/code)
          Co-Authored-By: ${{ github.event.inputs.assigned_ai }} <noreply@anthropic.com>
        title: "[${{ github.event.inputs.assigned_ai }}] ${{ steps.analysis.outputs.pr_title }}"
        body: |
          ## 実装概要
          ${{ steps.analysis.outputs.implementation_summary }}
          
          ## 変更内容  
          ${{ steps.generate.outputs.changes_summary }}
          
          ## テスト状況
          ${{ steps.generate.outputs.test_status }}
          
          ## レビューポイント
          ${{ steps.analysis.outputs.review_points }}
          
          Closes #${{ github.event.inputs.issue_number }}
        branch: feature/${{ github.event.inputs.assigned_ai }}-issue-${{ github.event.inputs.issue_number }}
        
    - name: Update Issue Progress
      uses: actions/github-script@v7
      with:
        script: |
          await github.rest.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: ${{ github.event.inputs.issue_number }},
            body: `## 🚀 ${{ github.event.inputs.assigned_ai }} 実装完了

            ### 実装内容
            ${{ steps.analysis.outputs.implementation_summary }}

            ### Pull Request
            #${{ steps.create-pr.outputs.pull-request-number }}

            ### 次のアクション
            - [ ] コードレビュー (@qa-mira)
            - [ ] テスト実行確認
            - [ ] マージ承認待ち

            ---
            *${{ github.event.inputs.assigned_ai }} | 自動生成 | $(date)*`
          });
```

### 3. 品質保証AI (`qa-automation.yml`)
**⚠️ 重要: QA-Miraは品質確認・テスト・レポートのみ。実装は一切行わない**

```yaml
name: QA-Mira Automation - Quality Check Only
on:
  pull_request:
    types: [opened, synchronize]
  workflow_dispatch:

jobs:
  qa-analysis:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Load QA-Mira Character
      id: character
      run: |
        echo "character_prompt=$(cat AI_CHARACTER_INITIAL_PROMPTS.md | sed -n '/# QA-Mira/,/# Security-Zane/p' | head -n -1)" >> $GITHUB_OUTPUT
        
    - name: QA Analysis
      id: analysis
      env:
        CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}
      run: |
        # QA-Miraキャラクター + PR内容でテスト分析
        python scripts/qa-analysis.py \
          --character-prompt "${{ steps.character.outputs.character_prompt }}" \
          --pr-number ${{ github.event.pull_request.number }} \
          --action "comprehensive quality analysis"
          
    - name: Run Automated Tests
      run: |
        # QA-Miraの指示に基づく自動テスト実行
        python scripts/run-qa-tests.py \
          --test-plan '${{ steps.analysis.outputs.test_plan }}' \
          --coverage-target 85
          
    - name: Generate Documentation
      run: |
        # QA-Mira新機能: ドキュメント自動生成
        python scripts/generate-docs.py \
          --pr-changes '${{ steps.analysis.outputs.changes }}' \
          --character qa-mira
          
    - name: Quality Report
      uses: actions/github-script@v7
      with:
        script: |
          const report = JSON.parse('${{ steps.analysis.outputs.quality_report }}');
          
          await github.rest.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: ${{ github.event.pull_request.number }},
            body: `## 🔍 QA-Mira 品質分析レポート

            ### 品質スコア: ${report.quality_score}/100

            ### テスト結果
            - カバレッジ: ${report.test_coverage}%
            - 自動テスト: ${report.auto_tests_passed}/${report.auto_tests_total} 通過
            - 品質ゲート: ${report.quality_gate_status}

            ### 発見された課題
            ${report.issues.map(issue => \`- ❌ \${issue}\`).join('\\n')}

            ### ドキュメント生成状況
            - API文書: ${report.api_docs_generated}
            - テスト仕様: ${report.test_docs_generated}  
            - 品質レポート: ${report.quality_report_generated}

            ### 推奨アクション
            ${report.recommendations.map(rec => \`- 📋 \${rec}\`).join('\\n')}

            ---
            *QA-Mira | 品質第一 | エッジケース、考慮しましたか？*`
          });
```

### 4. セキュリティAI (`security-automation.yml`)

```yaml
name: Security-Zane Automation
on:
  pull_request:
    types: [opened, synchronize]
  schedule:
    - cron: '0 9 * * 1'  # 毎週月曜9時
  workflow_dispatch:

jobs:
  security-audit:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Load Security-Zane Character
      id: character
      run: |
        echo "character_prompt=$(cat AI_CHARACTER_INITIAL_PROMPTS.md | sed -n '/# Security-Zane/,/# UI-Luna/p' | head -n -1)" >> $GITHUB_OUTPUT
        
    - name: Security Analysis
      id: analysis  
      env:
        CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}
      run: |
        # Security-Zaneキャラクター + コード変更でセキュリティ分析
        python scripts/security-analysis.py \
          --character-prompt "${{ steps.character.outputs.character_prompt }}" \
          --pr-number ${{ github.event.pull_request.number }} \
          --action "comprehensive security audit"
          
    - name: OWASP Security Scan
      run: |
        # Security-Zaneの指示に基づくセキュリティスキャン
        python scripts/owasp-scan.py \
          --scan-targets '${{ steps.analysis.outputs.scan_targets }}' \
          --severity-threshold high
          
    - name: Vulnerability Assessment
      run: |
        # 脆弱性評価・対策提案
        python scripts/vulnerability-assessment.py \
          --analysis-result '${{ steps.analysis.outputs.security_report }}'
          
    - name: Security Report
      uses: actions/github-script@v7
      with:
        script: |
          const report = JSON.parse('${{ steps.analysis.outputs.security_report }}');
          
          if (report.critical_issues.length > 0) {
            // Critical issues found - create urgent issue
            await github.rest.issues.create({
              owner: context.repo.owner,
              repo: context.repo.repo,
              title: `🚨 [CRITICAL SECURITY] ${report.critical_summary}`,
              body: \`## 🛡️ Security-Zane 緊急セキュリティ警告

              ### Critical 脆弱性検出
              \${report.critical_issues.map(issue => \`- 🚨 \${issue}\`).join('\\n')}

              ### 即座対応が必要
              - 影響度: Critical
              - 対応期限: 24時間以内
              - 担当者: @sparkminan

              ### 推奨対策
              \${report.immediate_actions.map(action => \`- 🔧 \${action}\`).join('\\n')}

              この実装、セキュアですか？緊急対応をお願いします。

              ---
              *Security-Zane | セキュリティ第一 | 脅威モデルを考えましょう*\`,
              labels: ['type/security', 'priority/critical', 'automation/ai-task']
            });
          }
          
          // Regular security comment on PR
          await github.rest.issues.createComment({
            owner: context.repo.owner,
            repo: context.repo.repo,
            issue_number: ${{ github.event.pull_request.number }},
            body: \`## 🛡️ Security-Zane セキュリティ監査

            ### セキュリティスコア: \${report.security_score}/100

            ### 脆弱性検査結果
            - Critical: \${report.critical_count} 件
            - High: \${report.high_count} 件  
            - Medium: \${report.medium_count} 件
            - Low: \${report.low_count} 件

            ### OWASP Top 10 チェック
            \${Object.entries(report.owasp_check).map(([key, value]) => \`- \${value ? '✅' : '❌'} \${key}\`).join('\\n')}

            ### セキュリティ推奨事項
            \${report.recommendations.map(rec => \`- 🔒 \${rec}\`).join('\\n')}

            \${report.security_score >= 80 ? '✅ セキュリティ承認' : '❌ セキュリティ要改善'}

            ---
            *Security-Zane | 常にリスクを考える | この実装、セキュアですか？*\`
          });
```

---

## 📁 支援スクリプト構造

### `/scripts/` ディレクトリ構成

```
scripts/
├── pm-aiden-analysis.py        # PM-Aiden分析・タスク分解
├── create-subtasks.py          # 子Issue作成
├── trigger-specialist.py       # 専門AI起動
├── fullstack-analysis.py       # フルスタック開発分析
├── code-generator.py           # コード生成
├── qa-analysis.py              # QA品質分析
├── run-qa-tests.py             # テスト実行
├── generate-docs.py            # ドキュメント生成
├── security-analysis.py        # セキュリティ分析
├── owasp-scan.py              # OWASPスキャン
├── vulnerability-assessment.py # 脆弱性評価
├── ui-analysis.py             # UI/UX分析
├── devops-automation.py       # DevOps自動化
└── utils/
    ├── claude-api.py          # Claude API ラッパー
    ├── github-utils.py        # GitHub操作ユーティリティ
    └── character-loader.py    # AIキャラクター読み込み
```

### 例: `pm-aiden-analysis.py`

```python
#!/usr/bin/env python3
"""
PM-Aiden Issue分析・タスク分解スクリプト
"""

import json
import sys
import argparse
from utils.claude_api import ClaudeAPI
from utils.character_loader import load_character_prompt

def analyze_issue(issue_number, issue_title, issue_body):
    """PM-AidenキャラクターでIssue分析"""
    
    # PM-Aiden初期プロンプト読み込み
    pm_aiden_prompt = load_character_prompt("PM-Aiden")
    
    # 分析指示
    analysis_instruction = f"""
    以下のIssueを分析し、PM-Aidenとして適切な対応を決定してください：

    Issue #{issue_number}: {issue_title}
    
    内容:
    {issue_body}
    
    以下の形式でJSON出力してください：
    {{
        "analysis_summary": "Issue分析サマリー",
        "task_breakdown": [
            {{"task": "タスク名", "assigned_ai": "担当AI", "priority": "優先度", "estimated_hours": "見積時間"}}
        ],
        "recommended_labels": ["推奨ラベル1", "推奨ラベル2"],
        "assigned_ai": "メイン担当AI",
        "risk_assessment": "リスク評価",
        "success_criteria": ["成功基準1", "成功基準2"]
    }}
    """
    
    # Claude API呼び出し
    claude = ClaudeAPI()
    response = claude.generate(
        character_prompt=pm_aiden_prompt,
        user_input=analysis_instruction,
        model="claude-3-sonnet"
    )
    
    try:
        analysis_result = json.loads(response)
        print(f"::set-output name=result::{json.dumps(analysis_result)}")
        print(f"::set-output name=assigned_ai::{analysis_result['assigned_ai']}")
        return analysis_result
    except json.JSONDecodeError:
        print("Error: Failed to parse Claude response as JSON")
        sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--issue-number", required=True)
    parser.add_argument("--issue-title", required=True) 
    parser.add_argument("--issue-body", required=True)
    
    args = parser.parse_args()
    
    result = analyze_issue(args.issue_number, args.issue_title, args.issue_body)
```

---

## 📊 進捗レポート自動生成

### 5. 進捗レポート生成 (`progress-report.yml`)

```yaml
name: Weekly Progress Report
on:
  schedule:
    - cron: '0 17 * * 5'  # 毎週金曜17時
  workflow_dispatch:

jobs:
  generate-report:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v4
      
    - name: Generate Weekly Report
      id: report
      env:
        CLAUDE_API_KEY: ${{ secrets.CLAUDE_API_KEY }}
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      run: |
        # PM-Aidenキャラクターで週次レポート生成
        python scripts/generate-weekly-report.py \
          --character pm-aiden \
          --date-range "last-week" \
          --output-format markdown
          
    - name: Create Report File
      run: |
        mkdir -p reports
        echo '${{ steps.report.outputs.report_content }}' > reports/sprint-$(date +%Y-%m-%d).md
        
    - name: Commit Report
      uses: stefanzweifel/git-auto-commit-action@v4
      with:
        commit_message: |
          📊 PM-Aiden週次進捗レポート $(date +%Y-%m-%d)
          
          ROI 195%達成に向けた週次分析・改善提案
          
          🤖 Generated with [Claude Code](https://claude.ai/code)
          Co-Authored-By: PM-Aiden <noreply@anthropic.com>
        file_pattern: reports/*.md
```

---

## 🎛 運用フロー例

### 通常開発フロー
```
1. sparkさん: Issue作成 + `automation/ai-task` ラベル付与
2. PM-Aiden: 自動分析・タスク分解・担当AI決定
3. 担当AI: 自動実装・PR作成
4. QA-Mira: 自動品質チェック・テスト実行
5. Security-Zane: 自動セキュリティ監査
6. PM-Aiden: 週次進捗レポート自動生成
```

### 緊急対応フロー
```
1. Security-Zane: 脆弱性検出 → 緊急Issue自動作成
2. PM-Aiden: 緊急トリアージ・優先度最高設定
3. 担当AI: 24時間以内対応・修正実装
4. QA-Mira: 緊急テスト・品質確認
5. DevOps-Rex: 緊急デプロイ・監視強化
```

---

## 🔧 セットアップ手順

### 1. GitHub Secrets設定
```
CLAUDE_API_KEY: Claude API キー
GITHUB_TOKEN: GitHub Personal Access Token (repo, issues, pull_requests権限)
```

### 2. ディレクトリ構造作成
```bash
mkdir -p .github/workflows
mkdir -p scripts/utils
mkdir -p reports
```

### 3. 初期ファイル配置
- AI初期プロンプト: `AI_CHARACTER_INITIAL_PROMPTS.md`
- ワークフローファイル: `.github/workflows/*.yml`
- 支援スクリプト: `scripts/*.py`

### 4. 動作テスト
```bash
# テスト用Issue作成
gh issue create --title "Test: AI自動化テスト" --label "automation/ai-task" --body "AI自動化機能のテスト実行"
```

---

## 🎯 期待効果

### 📈 効率化指標
- **Issue処理時間**: 50%短縮 (自動分析・自動実装)
- **品質向上**: 90%のバグを開発段階で自動検出
- **セキュリティ**: 100%のコード変更をセキュリティ監査
- **ドキュメント**: 95%のドキュメントを自動生成・更新
- **進捗可視化**: 100%の作業がGitHub上で透明化

### 🤖 AI活用効果
- **24時間稼働**: 人間の休息時間もAIが継続作業
- **一貫性**: キャラクター設定による一貫した品質・判断
- **専門性**: 各分野のエキスパートAIによる高品質な作業
- **学習効果**: 過去のIssue・PR履歴からのパターン学習

---

**この設計に基づいて、完全なGitHub駆動AI開発チームを実現しましょう！**

---

*設計者: PM-Aiden | 承認: sparkさん | 実装予定: 2025年8月*