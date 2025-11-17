# cc-backlog

[English](./README.md) | 日本語

> Claude Code から Backlog プロジェクト管理を実現するコマンド集

Backlog のプロジェクト管理ワークフローを Claude Code セッション内で直接利用できます。シンプルな`/bl:`コマンドで PM スタイルのタスク管理を実現します。

## 特徴

- 🎯 **プロジェクトコンテキスト管理** - Backlog プロジェクトのシームレスな切り替え
- 📝 **課題ライフサイクル** - 課題の作成・開始・更新・完了をシンプルなコマンドで
- 🤖 **インテリジェントなタスク推奨** - 優先度アルゴリズムに基づく次のタスク提案
- 📊 **進捗ダッシュボード** - 完了メトリクスを含むビジュアルなプロジェクト状況
- 💾 **セッション間の永続化** - Claude Code セッションをまたいだコンテキスト維持
- 🚀 **一括操作** - CSV/JSON ファイルから複数課題を一括作成

## クイックスタート

### 前提条件

1. **Backlog アカウント** - API アクセス権限付き
2. **Claude Code CLI** - [Anthropic's Claude Code](https://docs.claude.com/en/docs/claude-code)
3. **Node.js** - バージョン14以上（Backlog APIクライアントの実行に必要）

### MCPサーバー不要

cc-backlog は **Backlog API への直接呼び出し** を使用しており、MCP サーバーは不要です：

- ✅ **セットアップが簡単**: API キーだけで、サーバー設定不要
- ✅ **信頼性向上**: Backlog API との直接通信
- ✅ **パフォーマンス向上**: MCP サーバーのオーバーヘッドなし

### インストール

このリポジトリをプロジェクトにクローン：

```bash
cd your-project
git clone https://github.com/bellsanct/cc-backlog .claude-backlog
cp -r .claude-backlog/.claude .
```

詳細な設定手順は[セットアップガイド](./docs/setup.ja.md)をご覧ください。

### はじめてのコマンド

```bash
# 利用可能なプロジェクトをリスト表示
/bl:project-list

# 作業プロジェクトを設定
/bl:project-set MYPRJ

# 課題を作成
/bl:issue-create --title "機能Xを実装" --type Feature --priority High

# 推奨される次のタスクを取得
/bl:next

# 課題の作業を開始
/bl:issue-start MYPRJ-123 --assignee-me

# プロジェクトステータスを確認
/bl:status

# 完了した課題をクローズ
/bl:issue-close MYPRJ-123 --resolution Fixed

# レスポンスを日本語で得たい
/bl:status　日本語でお願い
```

## コマンドリファレンス

### プロジェクトコンテキスト

| コマンド           | 説明                       | 例                               |
| ------------------ | -------------------------- | -------------------------------- |
| `/bl:project-set`  | 作業プロジェクトを設定     | `/bl:project-set MYPRJ`          |
| `/bl:project-list` | 全プロジェクトをリスト表示 | `/bl:project-list --active-only` |
| `/bl:project-info` | プロジェクト詳細を表示     | `/bl:project-info --verbose`     |

### 課題管理

| コマンド                | 説明                   | 例                                               |
| ----------------------- | ---------------------- | ------------------------------------------------ |
| `/bl:issue-create`      | 新規課題を作成         | `/bl:issue-create --title "バグ修正" --type Bug` |
| `/bl:issue-bulk-create` | CSV/JSON から一括作成  | `/bl:issue-bulk-create issues.csv`               |
| `/bl:issue-start`       | 課題の作業を開始       | `/bl:issue-start MYPRJ-123 --assignee-me`        |
| `/bl:issue-update`      | 課題プロパティを更新   | `/bl:issue-update MYPRJ-123 --status "処理中"`   |
| `/bl:issue-comment`     | 課題にコメントを追加   | `/bl:issue-comment MYPRJ-123 "進捗75%"`          |
| `/bl:issue-close`       | 完了課題をクローズ     | `/bl:issue-close MYPRJ-123 --resolution Fixed`   |
| `/bl:issue-list`        | フィルタ付き課題リスト | `/bl:issue-list --status Open --assignee me`     |

### ワークフロー

| コマンド          | 説明                           | 例                            |
| ----------------- | ------------------------------ | ----------------------------- |
| `/bl:next`        | 推奨タスクを取得               | `/bl:next --count 5`          |
| `/bl:status`      | プロジェクト状況ダッシュボード | `/bl:status --milestone v1.0` |
| `/bl:standup`     | デイリースタンドアップレポート | `/bl:standup --days 1`        |
| `/bl:blocked`     | ブロック中の課題を表示         | `/bl:blocked --assignee me`   |
| `/bl:in-progress` | 処理中の課題を表示             | `/bl:in-progress`             |

### マイルストーン

| コマンド               | 説明                           | 例                                      |
| ---------------------- | ------------------------------ | --------------------------------------- |
| `/bl:milestone-create` | マイルストーンを作成           | `/bl:milestone-create "v1.0.0"`         |
| `/bl:milestone-list`   | マイルストーンをリスト表示     | `/bl:milestone-list`                    |
| `/bl:milestone-assign` | 課題にマイルストーンを割り当て | `/bl:milestone-assign "v1.0" MYPRJ-123` |

### 同期

| コマンド     | 説明                             | 例                                            |
| ------------ | -------------------------------- | --------------------------------------------- |
| `/bl:sync`   | Backlog と同期                   | `/bl:sync --full`                             |
| `/bl:export` | プロジェクトデータをエクスポート | `/bl:export --format csv --output issues.csv` |

## 典型的なワークフロー

### 機能開発

```bash
# 1. プロジェクトを設定
/bl:project-set MYPRJ

# 2. 機能の課題を作成
/bl:issue-create --title "JWT ミドルウェアを実装" --type Feature --priority High
/bl:issue-create --title "ログインエンドポイントを追加" --type Feature --priority High

# 3. 次のタスクを取得
/bl:next

# 4. 作業を開始
/bl:issue-start MYPRJ-123 --assignee-me

# 5. 進捗を更新
/bl:issue-comment MYPRJ-123 "JWT ミドルウェア実装完了"

# 6. 完了時にクローズ
/bl:issue-close MYPRJ-123 --resolution Fixed

# 7. ステータスを確認
/bl:status
```

### バグトリアージ

```bash
# 1. CSVからバグをインポート
/bl:issue-bulk-create bugs.csv --type Bug

# 2. 優先度の高いバグを取得
/bl:next --type Bug --count 1

# 3. 修正を開始
/bl:issue-start MYPRJ-456 --assignee-me

# 4. 必要に応じてブロック状態にマーク
/bl:issue-update MYPRJ-456 --status Blocked --comment "API アクセスが必要"

# 5. すべてのブロッカーを確認
/bl:blocked
```

### デイリースタンドアップ

```bash
# 朝：作業内容を確認
/bl:next --count 5

# 最初のタスクを開始
/bl:issue-start MYPRJ-123 --assignee-me

# 作業中：更新を追加
/bl:issue-comment MYPRJ-123 "進捗：75%完了"

# タスクを終了
/bl:issue-close MYPRJ-123 --resolution Fixed

# 1日の終わり：スタンドアップを生成
/bl:standup --days 1

# 全体のステータスを確認
/bl:status
```

## ドキュメント

- [セットアップガイド](./docs/setup.ja.md) - インストールと設定
- [ワークフローガイド](./docs/workflows.ja.md) - 一般的な PM ワークフロー
- コマンドリファレンスは`.claude/commands/bl/`ディレクトリ内で参照可能

## プロジェクト構成

```
cc-backlog/
├── .claude/
│   ├── commands/bl/          # コマンド実装
│   │   ├── project-set.md
│   │   ├── issue-create.md
│   │   ├── next.md
│   │   └── ...
│   ├── context/              # 設定とランタイムコンテキスト
│   │   ├── backlog-config.json
│   │   ├── workflow-config.json
│   │   └── ...
│   └── templates/            # 課題テンプレート
├── lib/                      # コアライブラリ (NEW)
│   ├── backlog-api.js        # 直接Backlog APIクライアント
│   ├── utils.js              # ユーティリティ関数
│   └── cli-runner.js         # コマンド実行エンジン
├── docs/                     # ドキュメント
├── .env.example              # 環境変数設定テンプレート
├── MIGRATION_GUIDE.md        # MCPからの移行ガイド
└── README.md                 # このファイル
```

## ライセンス

MIT License - 詳細は[LICENSE](./LICENSE)をご覧ください。

## 謝辞

- [Backlog API](https://developer.nulab.com/ja/docs/backlog/)を利用
- [Claude Code](https://docs.claude.com/en/docs/claude-code)で動作
- 以前のバージョンでは [nulab/backlog-mcp-server](https://github.com/nulab/backlog-mcp-server) を使用していました

## サポート

- 📚 [ドキュメント](./docs/)
- 🐛 [課題トラッカー](https://github.com/bellsanct/cc-backlog/issues)
- 💬 [ディスカッション](https://github.com/bellsanct/cc-backlog/discussions)

---

Claude Code でより良いプロジェクト管理を ❤️
