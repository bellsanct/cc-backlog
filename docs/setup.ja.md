# cc-backlog セットアップガイド

[English](./setup.md) | 日本語

cc-backlog のインストールと設定の完全ガイドです。

## 目次

1. [前提条件](#前提条件)
2. [インストール](#インストール)
3. [検証](#検証)

---

## 前提条件

### 必須

1. **Backlog アカウント**

   - Backlog Cloud または Enterprise の有効なアカウント
   - API アクセスが有効
   - アクセス可能なプロジェクトが最低 1 つ

2. **Backlog API キー**

   - Backlog から生成：個人設定 → API → 生成
   - 安全に保管し、バージョン管理にコミットしないこと

3. **Claude Code CLI**

   - Anthropic's Claude Code がインストール済み
   - バージョン：最新版を推奨
   - ドキュメント：https://docs.claude.com/en/docs/claude-code
   - **注意**: Claude Desktop アプリとは異なります

4. **Node.js**

   - バージョン：14以上
   - Backlog API クライアントの実行に必要

### MCPサーバー不要

cc-backlog は **Backlog API への直接呼び出し** を使用しており、MCP サーバーは不要です：

- ✅ **セットアップが簡単**: API キーだけで、サーバー設定不要
- ✅ **信頼性向上**: Backlog API との直接通信
- ✅ **パフォーマンス向上**: MCP サーバーのオーバーヘッドなし

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

### 環境設定

cc-backlog コマンドをテストする前に、環境変数が設定されていることを確認してください：

```bash
# 環境変数が設定されていることを確認
echo $BACKLOG_API_KEY
echo $BACKLOG_SPACE_KEY
```

未設定の場合、プロジェクトルートに `.env` ファイルを作成してください：

```bash
# 環境変数サンプルファイルをコピー
cp .env.example .env

# 認証情報を編集
# BACKLOG_SPACE_KEY=your-space
# BACKLOG_API_KEY=your-api-key
```

### インストールのテスト

```bash
# プロジェクトディレクトリでClaude Codeを起動
cd your-project

# テスト 1: プロジェクトをリスト表示
/bl:project-list

# 期待される結果：アクセス可能なBacklogプロジェクトのテーブル
# エラーの場合：API認証情報とBacklog APIアクセスを確認

# テスト 2: プロジェクトを設定
/bl:project-set YOUR_PROJECT_NAME

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

### 問題：「プロジェクトが見つかりません」

**原因**：API キーにプロジェクトアクセス権限がない

**解決方法**：

1. API キーが正しいことを確認
2. Backlog プロジェクトの権限を確認
3. 最低 1 つのプロジェクトのメンバーであることを確認
4. API アクセスをテスト：
   ```bash
   curl -H "Authorization: Bearer $BACKLOG_API_KEY" \
        https://your-space.backlog.com/api/v2/projects
   ```

### 問題：「認証に失敗しました」

**原因**：無効または期限切れの API キー

**解決方法**：

1. `BACKLOG_API_KEY`環境変数を確認：
   ```bash
   echo $BACKLOG_API_KEY
   ```
2. Backlog 設定で API キーを再生成
3. `.env` ファイルまたは環境変数を更新
4. Claude Code セッションを再起動

### 問題：「プロジェクトコンテキストファイルが破損しています」

**原因**：コンテキストファイル内の無効な JSON

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
3. **コマンドを確認**：`.claude/commands/bl/`内のコマンドファイルを参照
4. **カスタマイズ**：優先度アルゴリズムとテンプレートを調整

---

## サポート

- 📚 [完全ドキュメント](../README.ja.md)
- 🐛 [課題を報告](https://github.com/bellsanct/cc-backlog/issues)
- 💬 [ディスカッション](https://github.com/bellsanct/cc-backlog/discussions)
