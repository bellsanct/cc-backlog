# cc-backlog セットアップガイド

[English](./setup.md) | 日本語

cc-backlogのインストールと設定の完全ガイドです。

## 目次

1. [前提条件](#前提条件)
2. [インストール](#インストール)
3. [検証](#検証)

---

## 前提条件

### 必須

1. **Backlogアカウント**
   - Backlog CloudまたはEnterpriseの有効なアカウント
   - API アクセスが有効
   - アクセス可能なプロジェクトが最低1つ

2. **Backlog API キー**
   - Backlogから生成：個人設定 → API → 生成
   - 安全に保管し、バージョン管理にコミットしないこと

3. **Claude Code CLI**
   - Anthropic's Claude Codeがインストール済み
   - バージョン：最新版を推奨
   - ドキュメント：https://docs.claude.com/en/docs/claude-code
   - **注意**: Claude Desktopアプリとは異なります

4. **BacklogMCP サーバー**（Claude Code用に設定）
   - [nulab/backlog-mcp-server](https://github.com/nulab/backlog-mcp-server)
   - Claude CodeのMCP設定で構成する必要があります
   - Claude Desktopを使用している場合：BacklogMCP設定は別で、Claude Codeでは動作しません

### Claude Desktopユーザーの方へ

すでにClaude DesktopでBacklogMCPを使用している場合：

- **Claude Desktop ≠ Claude Code**: これらは別のアプリケーションです
- **MCP設定は別々**: Claude DesktopのMCP設定はClaude Codeでは利用できません
- **両方の設定が必要**: Claude Code用に別途BacklogMCPをインストール・設定する必要があります
- **設定ファイルの場所**:
  - Claude Desktop: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)
  - Claude Code: `.claude/mcp_settings.json` またはグローバルMCP設定

Claude Code用のBacklogMCP設定方法はこちら: https://github.com/nulab/backlog-mcp-server

---

## インストール

### ステップ 1: リポジトリをクローン

```bash
# プロジェクトに移動
cd /path/to/your/project

# cc-backlogをクローン
git clone https://github.com/bellsanct/cc-backlog.git .cc-backlog

# .claudeディレクトリをプロジェクトにコピー
cp -r .cc-backlog/.claude .
```

または、新規プロジェクトの場合：

```bash
# 新規プロジェクトディレクトリを作成
mkdir my-backlog-project
cd my-backlog-project

# 直接クローン
git clone https://github.com/bellsanct/cc-backlog.git .
```

### ステップ 2: ディレクトリ構成

インストール後、プロジェクトには以下が含まれます：

```
your-project/
├── .claude/
│   ├── commands/bl/          # cc-backlogコマンド
│   ├── context/              # 設定ファイル
│   └── templates/            # 課題テンプレート
├── docs/
└── README.md
```

---

## 検証

### 前提条件の確認

cc-backlogコマンドをテストする前に、BacklogMCPサーバーが起動・設定されていることを確認してください：

```bash
# BacklogMCPサーバーがアクセス可能か確認
# （セットアップ方法はBacklogMCPのドキュメントを参照）

# 環境変数が設定されていることを確認
echo $BACKLOG_API_KEY
echo $BACKLOG_SPACE_KEY
```

### インストールのテスト

```bash
# プロジェクトディレクトリでClaude Codeを起動
cd your-project

# テスト 1: プロジェクトをリスト表示（BacklogMCP設定が必要）
/bl:project-list

# 期待される結果：アクセス可能なBacklogプロジェクトのテーブル
# エラーの場合：BacklogMCPサーバーのステータスとAPI認証情報を確認

# テスト 2: プロジェクトを設定
/bl:project-set YOUR_PROJECT_KEY

# 期待される結果：プロジェクトコンテキスト保存の確認

# テスト 3: プロジェクト情報を表示
/bl:project-info

# 期待される結果：プロジェクト詳細の表示

# テスト 4: 課題をリスト表示
/bl:issue-list --limit 5

# 期待される結果：最近の課題のテーブル

# テスト 5: 次のタスクを取得
/bl:next

# 期待される結果：優先度に基づく推奨タスク
```

### 作成されたファイルの確認

```bash
# コンテキストファイルが作成されたことを確認
ls -la .claude/context/

# コマンド実行後に以下が表示されるはず：
# - backlog-project.json (/bl:project-set 実行後)
```

---

## トラブルシューティング

### 問題：「BacklogMCPサーバーが利用できません」

**原因**：BacklogMCPサーバーが起動していないか、アクセスできない

**解決方法**：
```bash
# サーバーが起動しているか確認
docker ps | grep backlog-mcp
# または
curl http://localhost:3000/health

# サーバーを再起動
docker restart backlog-mcp
# または
npx @nulab/backlog-mcp-server
```

### 問題：「プロジェクトが見つかりません」

**原因**：APIキーにプロジェクトアクセス権限がない

**解決方法**：
1. APIキーが正しいことを確認
2. Backlogプロジェクトの権限を確認
3. 最低1つのプロジェクトのメンバーであることを確認
4. APIアクセスをテスト：
   ```bash
   curl -H "Authorization: Bearer $BACKLOG_API_KEY" \
        https://your-space.backlog.com/api/v2/projects
   ```

### 問題：「認証に失敗しました」

**原因**：無効または期限切れのAPIキー

**解決方法**：
1. `BACKLOG_API_KEY`環境変数を確認：
   ```bash
   echo $BACKLOG_API_KEY
   ```
2. Backlog設定でAPIキーを再生成
3. 環境変数を更新
4. BacklogMCPサーバーを再起動

### 問題：「プロジェクトコンテキストファイルが破損しています」

**原因**：コンテキストファイル内の無効なJSON

**解決方法**：
```bash
# JSONを検証
cat .claude/context/backlog-project.json | jq .

# 無効な場合、リセット：
rm .claude/context/backlog-project.json
/bl:project-set YOUR_PROJECT_KEY
```

### 問題：コマンドが認識されない

**原因**：`.claude/commands/bl/`が正しい場所にない

**解決方法**：
```bash
# コマンドファイルが存在することを確認
ls .claude/commands/bl/

# 以下が表示されるはず：
# project-set.md, issue-create.md, next.md, など

# 見つからない場合、cc-backlogリポジトリから再コピー
```

---

## 次のステップ

1. **コマンドを学ぶ**：[コマンドリファレンス](../README.ja.md#コマンドリファレンス)を読む
2. **ワークフローを探る**：[ワークフローガイド](./workflows.ja.md)を参照
3. **仕様を確認**：[SPECIFICATION.md](../SPECIFICATION.md)をチェック
4. **カスタマイズ**：優先度アルゴリズムとテンプレートを調整

---

## サポート

- 📚 [完全ドキュメント](../README.ja.md)
- 🐛 [課題を報告](https://github.com/bellsanct/cc-backlog/issues)
- 💬 [ディスカッション](https://github.com/bellsanct/cc-backlog/discussions)
