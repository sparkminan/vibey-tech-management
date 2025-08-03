#!/usr/bin/env node

/**
 * GitHub データ同期スクリプト
 * GitHub Issues, Projects, Pull Requests のデータを取得して
 * ローカルにキャッシュし、ダッシュボードを生成します
 */

const { Octokit } = require('@octokit/rest');
const fs = require('fs').promises;
const path = require('path');

// 設定
const CONFIG = {
    owner: 'sparkminan',
    repos: ['claude-code-remote', 'henkaku-ai-archive'],
    dataDir: path.join(__dirname, '..', 'data'),
    dashboardDir: path.join(__dirname, '..', 'dashboards')
};

// GitHub クライアントの初期化
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
});

/**
 * リポジトリのIssuesを取得
 */
async function fetchIssues(repo) {
    try {
        const issues = await octokit.paginate(octokit.issues.listForRepo, {
            owner: CONFIG.owner,
            repo: repo,
            state: 'all',
            per_page: 100
        });

        return issues.filter(issue => !issue.pull_request);
    } catch (error) {
        console.error(`Error fetching issues for ${repo}:`, error.message);
        return [];
    }
}

/**
 * リポジトリのPull Requestsを取得
 */
async function fetchPullRequests(repo) {
    try {
        const pulls = await octokit.paginate(octokit.pulls.list, {
            owner: CONFIG.owner,
            repo: repo,
            state: 'all',
            per_page: 100
        });

        return pulls;
    } catch (error) {
        console.error(`Error fetching PRs for ${repo}:`, error.message);
        return [];
    }
}

/**
 * リポジトリのマイルストーンを取得
 */
async function fetchMilestones(repo) {
    try {
        const milestones = await octokit.paginate(octokit.issues.listMilestones, {
            owner: CONFIG.owner,
            repo: repo,
            state: 'all',
            per_page: 100
        });

        return milestones;
    } catch (error) {
        console.error(`Error fetching milestones for ${repo}:`, error.message);
        return [];
    }
}

/**
 * プロジェクトボードのデータを取得
 */
async function fetchProjects(repo) {
    try {
        // GitHub Projects (classic) の取得
        const projects = await octokit.projects.listForRepo({
            owner: CONFIG.owner,
            repo: repo
        });

        return projects.data;
    } catch (error) {
        console.error(`Error fetching projects for ${repo}:`, error.message);
        return [];
    }
}

/**
 * データを集計して統計を生成
 */
function generateStatistics(data) {
    const stats = {
        totalIssues: 0,
        openIssues: 0,
        closedIssues: 0,
        totalPRs: 0,
        openPRs: 0,
        mergedPRs: 0,
        labelCounts: {},
        priorityCounts: {
            critical: 0,
            high: 0,
            medium: 0,
            low: 0
        },
        typeCounts: {
            bug: 0,
            feature: 0,
            enhancement: 0,
            documentation: 0
        }
    };

    // Issues の集計
    data.repos.forEach(repo => {
        repo.issues.forEach(issue => {
            stats.totalIssues++;
            if (issue.state === 'open') {
                stats.openIssues++;
            } else {
                stats.closedIssues++;
            }

            // ラベルの集計
            issue.labels.forEach(label => {
                const name = label.name.toLowerCase();
                
                // 優先度
                if (name.includes('critical')) stats.priorityCounts.critical++;
                else if (name.includes('high')) stats.priorityCounts.high++;
                else if (name.includes('medium')) stats.priorityCounts.medium++;
                else if (name.includes('low')) stats.priorityCounts.low++;

                // タイプ
                if (name.includes('bug')) stats.typeCounts.bug++;
                else if (name.includes('feature')) stats.typeCounts.feature++;
                else if (name.includes('enhancement')) stats.typeCounts.enhancement++;
                else if (name.includes('documentation')) stats.typeCounts.documentation++;
            });
        });

        // PRs の集計
        repo.pullRequests.forEach(pr => {
            stats.totalPRs++;
            if (pr.state === 'open') {
                stats.openPRs++;
            } else if (pr.merged_at) {
                stats.mergedPRs++;
            }
        });
    });

    return stats;
}

/**
 * ダッシュボードを生成
 */
async function generateDashboard(data, stats) {
    const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    
    let dashboard = `# Vibey Technologies - GitHub 統計ダッシュボード
最終更新: ${now}

## 📊 リポジトリ別統計

| リポジトリ | Open Issues | Open PRs | 最終更新 |
|-----------|-------------|----------|----------|
`;

    data.repos.forEach(repo => {
        const openIssues = repo.issues.filter(i => i.state === 'open').length;
        const openPRs = repo.pullRequests.filter(pr => pr.state === 'open').length;
        const lastUpdate = repo.issues[0]?.updated_at || 'N/A';
        
        dashboard += `| [${repo.name}](https://github.com/${CONFIG.owner}/${repo.name}) | ${openIssues} | ${openPRs} | ${lastUpdate ? new Date(lastUpdate).toLocaleDateString() : 'N/A'} |\n`;
    });

    dashboard += `
## 📈 全体統計

### Issues
- **Total**: ${stats.totalIssues}
- **Open**: ${stats.openIssues}
- **Closed**: ${stats.closedIssues}

### Pull Requests
- **Total**: ${stats.totalPRs}
- **Open**: ${stats.openPRs}
- **Merged**: ${stats.mergedPRs}

### 優先度分布
- 🔴 Critical: ${stats.priorityCounts.critical}
- 🟠 High: ${stats.priorityCounts.high}
- 🟡 Medium: ${stats.priorityCounts.medium}
- 🟢 Low: ${stats.priorityCounts.low}

### タイプ別分布
- 🐛 Bugs: ${stats.typeCounts.bug}
- ✨ Features: ${stats.typeCounts.feature}
- 💎 Enhancements: ${stats.typeCounts.enhancement}
- 📝 Documentation: ${stats.typeCounts.documentation}
`;

    // ファイルに保存
    const dashboardPath = path.join(CONFIG.dashboardDir, 'GITHUB_STATS.md');
    await fs.writeFile(dashboardPath, dashboard);
    
    console.log(`✅ ダッシュボードを生成しました: ${dashboardPath}`);
}

/**
 * メイン処理
 */
async function main() {
    console.log('🔄 GitHub データの同期を開始します...');

    // データディレクトリの作成
    await fs.mkdir(CONFIG.dataDir, { recursive: true });
    await fs.mkdir(CONFIG.dashboardDir, { recursive: true });

    const allData = {
        timestamp: new Date().toISOString(),
        repos: []
    };

    // 各リポジトリのデータを取得
    for (const repo of CONFIG.repos) {
        console.log(`📥 ${repo} のデータを取得中...`);
        
        const repoData = {
            name: repo,
            issues: await fetchIssues(repo),
            pullRequests: await fetchPullRequests(repo),
            milestones: await fetchMilestones(repo),
            projects: await fetchProjects(repo)
        };

        allData.repos.push(repoData);
        
        // 個別リポジトリのデータを保存
        const repoDataPath = path.join(CONFIG.dataDir, `${repo}.json`);
        await fs.writeFile(repoDataPath, JSON.stringify(repoData, null, 2));
        console.log(`✅ ${repo} のデータを保存しました`);
    }

    // 全体データを保存
    const allDataPath = path.join(CONFIG.dataDir, 'all-repos.json');
    await fs.writeFile(allDataPath, JSON.stringify(allData, null, 2));

    // 統計を生成
    const stats = generateStatistics(allData);
    const statsPath = path.join(CONFIG.dataDir, 'statistics.json');
    await fs.writeFile(statsPath, JSON.stringify(stats, null, 2));

    // ダッシュボードを生成
    await generateDashboard(allData, stats);

    console.log('✅ 同期が完了しました！');
}

// エラーハンドリング
process.on('unhandledRejection', (error) => {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
});

// 実行
if (require.main === module) {
    main();
}