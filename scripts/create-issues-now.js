const { Octokit } = require('@octokit/rest');

// GitHub Personal Access Token
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN || 'your-token-here'
});

const owner = 'sparkminan';
const repo = 'vibey-tech-management';

async function createInitialIssues() {
  console.log('Creating initial issues for project management...');

  try {
    // 1. 緊急セキュリティ対応
    const securityIssue = await octokit.rest.issues.create({
      owner,
      repo,
      title: '[QUALITY] Claude Code Remote 緊急セキュリティ修正',
      body: `## 🔍 品質課題の概要
Claude Code RemoteでHTTP平文通信・固定パスワードの重大なセキュリティ脆弱性を発見

## 📂 対象プロジェクト
- [x] Claude Code Remote
- [ ] HENKAKU AI Archive
- [ ] 横断的課題

## 🏷 品質分野
- [x] **セキュリティ** - 脆弱性・認証・暗号化

## 📊 現状分析

### 品質メトリクス
- **現在値**: セキュリティスコア D (重大な脆弱性あり)
- **目標値**: セキュリティスコア A+
- **測定方法**: OWASP基準 + 外部セキュリティ監査

### 影響度評価
- [x] 🔴 Critical - 本番環境に重大な影響

## 🔍 根本原因分析
1. **HTTP平文通信**: SSL/TLS未実装により通信内容が盗聴可能
2. **固定パスワード**: ソースコード内にハードコードされた認証情報
3. **コマンド制限なし**: 危険なシステムコマンドの実行が可能

## 📋 改善計画

### 短期対応（1-2週間）
- [ ] HTTPS/WSS実装 (工数: 8h, 予算: ¥300,000)
- [ ] 環境変数による認証情報管理 (工数: 4h, 予算: ¥200,000) 
- [ ] コマンドホワイトリスト実装 (工数: 6h, 予算: ¥300,000)

### 中期対応（1-2ヶ月）
- [ ] セキュリティ監査の自動化
- [ ] ペネトレーションテスト実施
- [ ] セキュリティ文書整備

## 🧪 検証方法
- OWASP ZAP によるセキュリティスキャン
- 外部専門家によるペネトレーションテスト
- SSL/TLS 設定の証明書確認

## 📊 成功基準
- [ ] セキュリティスコアA+達成
- [ ] 外部ペネトレーションテスト通過
- [ ] 本番環境での安全な動作確認
- [ ] 脆弱性報告0件

## 🔗 関連リソース
- 品質チェックリスト: [CODE_QUALITY_CHECKLIST.md](../CODE_QUALITY_CHECKLIST.md)
- 開発標準: [UNIFIED_DEVELOPMENT_STANDARDS.md](../UNIFIED_DEVELOPMENT_STANDARDS.md)

## 📝 補足情報
**緊急度**: 本番リリース前に必須対応
**予算**: 総額¥800,000（セキュリティ対応費用）
**期限**: 2025/8/6 17:00まで`,
      labels: ['type/quality', 'priority/critical', 'project/claude-code-remote', 'area/security']
    });

    console.log(`✅ Created security issue: #${securityIssue.data.number}`);

    // 2. テスト計画実行エピック
    const testEpic = await octokit.rest.issues.create({
      owner,
      repo,
      title: '[EPIC] 統合テスト計画実行 - 品質向上・ROI 195%達成',
      body: `## 📋 エピック概要
テスタ提案の61テストケース・12日間テスト計画を実行し、両プロジェクトの品質向上を実現する統合エピック

## 🎯 背景・目的
- テスタ分析により特定された品質課題を解決
- Claude Code Remote: セキュリティ脆弱性の根本解決
- HENKAKU AI Archive: パフォーマンス・テスト自動化の強化
- ROI 195%の投資効果を達成し、長期的な品質向上体制を確立

## 📊 受け入れ条件
- [ ] **セキュリティテスト**: Claude Code Remote全脆弱性解消
- [ ] **パフォーマンステスト**: HENKAKU AI Archive Lighthouse 95+達成
- [ ] **テスト自動化**: 両プロジェクトでカバレッジ85%以上
- [ ] **予算管理**: 総額¥4,100,000以内での完了
- [ ] **品質目標**: 全品質メトリクス目標値達成
- [ ] **最終報告**: 2025/8/16 完了報告書提出

## 🔗 関連ストーリー・タスク
- セキュリティ修正: #${securityIssue.data.number}
- iPhone実機調達・環境構築
- 外部セキュリティ専門家契約
- テスト自動化基盤構築
- 品質メトリクス監視システム

## 📅 見積もり・期限
- **総工数**: 40人日（160-225時間）
- **実行期間**: 12営業日（2025/8/4-8/16）
- **総予算**: ¥4,100,000
  - テスト実行費用: ¥3,100,000
  - セキュリティ修正: ¥800,000
  - 実機・インフラ: ¥200,000

## 🎨 実行フェーズ
### Phase 1: 緊急セキュリティ対応 (8/4-8/5)
- HTTPS/WSS実装
- 認証強化  
- コマンド制限

### Phase 2: 並行基本テスト (8/5-8/6)  
- セキュリティペネトレーションテスト
- パフォーマンステスト
- 自動化テスト実装

### Phase 3-5: 詳細テスト実行 (8/7-8/16)
- クロスブラウザテスト
- 統合・最終検証
- 報告書作成・提出

## 📝 ROI効果測定
**投資**: ¥4,100,000
**回避効果**: ¥8,000,000
**ROI**: 195%（12-15ヶ月で回収）`,
      labels: ['type/epic', 'priority/critical', 'project/cross-project']
    });

    console.log(`✅ Created test epic: #${testEpic.data.number}`);

    // 3. GitHub統合管理体系の構築
    const managementProject = await octokit.rest.issues.create({
      owner,
      repo,
      title: '[PROJECT] GitHub統合管理体系の本格運用開始',
      body: `## 🚀 プロジェクト概要
vibey-tech-managementリポジトリを中心とした統合プロジェクト管理体系の本格運用開始とチーム教育

## 💼 ビジネス価値
### 効率性向上
- Issue管理時間: 50%削減
- レポート作成時間: 80%削減  
- 進捗確認時間: 70%削減
- コミュニケーション効率: 30%向上

## 🎯 目標・KPI
- **主要目標**: GitHub統合管理体系の全社標準化
- **成功指標**: チーム満足度85%以上
- **KPI**: 
  - 週次レポート自動生成率: 100%
  - Issue処理時間: 平均24時間以内
  - プロジェクト遅延率: 10%以下

## 📅 タイムライン
- **開始予定**: 2025/8/4（基盤完成済み）
- **教育完了**: 2025/8/10
- **本格運用**: 2025/8/15
- **効果測定**: 2025/9/1

## 📋 初期バックログ
- [x] vibey-tech-managementリポジトリ作成
- [x] 統合ドキュメント体系構築
- [x] Issue テンプレート設定
- [x] 自動化ワークフロー実装
- [ ] GitHub Projectsボード作成
- [ ] チーム教育・トレーニング
- [ ] 運用ルール確立
- [ ] 効果測定・改善

## 🔗 関連リンク
- メインリポジトリ: https://github.com/sparkminan/vibey-tech-management
- セットアップガイド: [GITHUB_SETUP_GUIDE.md](../GITHUB_SETUP_GUIDE.md)`,
      labels: ['type/project', 'priority/high', 'project/cross-project']
    });

    console.log(`✅ Created management project: #${managementProject.data.number}`);

    // 4. iPhone実機調達タスク
    const deviceTask = await octokit.rest.issues.create({
      owner,
      repo,
      title: '[TASK] iPhone実機調達・テスト環境構築',
      body: `## タスクの内容
統合テスト計画実行のためのiPhone実機調達とテスト環境構築

## 目的
Claude Code Remoteのモバイル対応テストを実機で実施し、品質を保証

## 作業内容
- [ ] iPhone実機2台の調達（iPhone 14以降推奨）
- [ ] テスト用Apple IDの設定
- [ ] Safari動作テスト環境構築
- [ ] WebSocket接続テスト準備
- [ ] PWA機能テスト準備

## 完了条件
- [ ] iPhone実機でのClaude Code Remote動作確認
- [ ] Safari・Chrome両方での接続テスト成功
- [ ] PWA機能（ホーム画面追加）動作確認
- [ ] パフォーマンステスト準備完了

## 見積もり
- 工数: 8h
- 期限: 2025/8/5
- 予算: ¥200,000

## 依存関係
- ブロックされている: #${testEpic.data.number} (統合テスト実行)
- 関連: #${securityIssue.data.number} (セキュリティ修正後にテスト)`,
      labels: ['type/task', 'priority/high', 'project/claude-code-remote']
    });

    console.log(`✅ Created device task: #${deviceTask.data.number}`);

    // サマリー出力
    console.log('\n🎉 Initial issues created successfully!');
    console.log('\nCreated Issues:');
    console.log(`1. 🔴 Security Fix: #${securityIssue.data.number}`);
    console.log(`2. 🎯 Test Epic: #${testEpic.data.number}`);
    console.log(`3. 📋 Management Project: #${managementProject.data.number}`);
    console.log(`4. 📱 Device Task: #${deviceTask.data.number}`);
    console.log('\nNext steps:');
    console.log('1. Visit: https://github.com/sparkminan/vibey-tech-management/issues');
    console.log('2. Create GitHub Projects board');
    console.log('3. Add issues to project board');
    
    return {
      security: securityIssue.data.number,
      testEpic: testEpic.data.number,
      management: managementProject.data.number,
      device: deviceTask.data.number
    };

  } catch (error) {
    console.error('Error creating issues:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// 実行
createInitialIssues();