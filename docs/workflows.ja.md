# cc-backlog ワークフローガイド

[English](./workflows.md) | 日本語

cc-backlogコマンドを使用した一般的なプロジェクト管理ワークフローです。

## 目次

1. [機能開発](#機能開発)
2. [バグトリアージと修正](#バグトリアージと修正)
3. [スプリント計画](#スプリント計画)
4. [デイリースタンドアップ](#デイリースタンドアップ)
5. [リリース管理](#リリース管理)

---

## 機能開発

タスク分解を伴う新機能開発のエンドツーエンドワークフロー。

### ワークフロー概要

```
課題作成 → タスク選択 → 実装 → クローズ → ステータス確認
```

### ステップバイステップ

#### 1. プロジェクトコンテキストを設定

```bash
# 利用可能なプロジェクトをリスト表示
/bl:project-list

# 作業プロジェクトを設定
/bl:project-set MYPRJ

# プロジェクトが設定されたことを確認
/bl:project-info
```

**出力**：
```
✅ プロジェクト設定完了: MYPRJ - My Project
📊 課題：45 件オープン、120 件クローズ
👥 メンバー：8 人
```

#### 2. 機能課題を作成

```bash
# ユーザー認証機能の課題を作成
/bl:issue-create --title "JWT ミドルウェアを実装" --type Feature --priority High --milestone v1.0
/bl:issue-create --title "ログインエンドポイントを追加" --type Feature --priority High --milestone v1.0
/bl:issue-create --title "トークンリフレッシュエンドポイントを追加" --type Feature --priority Normal --milestone v1.0
```

**出力**：
```
✅ 課題作成完了：MYPRJ-123 - JWT ミドルウェアを実装
🔗 https://my-space.backlog.com/view/MYPRJ-123
📊 タイプ：Feature | 優先度：High

✅ 課題作成完了：MYPRJ-124 - ログインエンドポイントを追加
🔗 https://my-space.backlog.com/view/MYPRJ-124
📊 タイプ：Feature | 優先度：High
...
```

#### 3. 推奨される次のタスクを取得

```bash
# 上位3つの推奨タスクを取得
/bl:next --count 3
```

**出力**：
```
🎯 推奨される次のタスク：

1. 🔴 MYPRJ-123 - JWT ミドルウェアを実装
   タイプ：Feature | 優先度：High | 期限：今週
   スコア：85/100
   💡 マイルストーン：v1.0

2. 🟡 MYPRJ-124 - ログインエンドポイントを追加
   タイプ：Feature | 優先度：Normal | 期限：今週
   スコア：70/100
```

#### 4. タスクの作業を開始

```bash
# 最初の推奨タスクを開始
/bl:issue-start MYPRJ-123 --assignee-me --comment "JWT 実装を開始"
```

**出力**：
```
🚀 開始：MYPRJ-123 - JWT ミドルウェアを実装
📊 ステータス：未対応 → 処理中
👤 担当者：johndoe（あなた）
💬 コメント追加：「JWT 実装を開始」
⏰ 開始時刻：2025-01-10 14:30:00
```

#### 5. 進捗を更新

```bash
# 進捗コメントを更新
/bl:issue-comment MYPRJ-123 "トークン生成を実装、検証作業中"
```

#### 6. 完了したタスクをクローズ

```bash
# 完了時にクローズ
/bl:issue-close MYPRJ-123 --resolution Fixed --comment "JWT ミドルウェアをテスト付きで完了"
```

**出力**：
```
✅ クローズ：MYPRJ-123 - JWT ミドルウェアを実装
📊 ステータス：処理中 → 完了
🔧 対応内容：Fixed
💬 コメント：「JWT ミドルウェアをテスト付きで完了」
```

#### 7. 全体の進捗を確認

```bash
# プロジェクトステータスを表示
/bl:status --milestone v1.0
```

**出力**：
```
📊 マイルストーンステータス：v1.0
期限：2025-02-01（残り22日）

進捗：
[██████░░░░░░░░░░░░░░] 30% 完了（3/10 課題）

ステータス別：
  ✅ 完了：       3（30%）
  🔄 処理中：     2（20%）
  📋 未対応：     5（50%）
```

---

## バグトリアージと修正

効率的にバグを管理・修正するワークフロー。

### ステップバイステップ

#### 1. CSV からバグをインポート

`bugs.csv`を作成：
```csv
title,description,priority,category,assignee
"モバイルでログイン失敗","モバイルブラウザからログインできない",High,Frontend,johndoe
"API タイムアウト","/api/users エンドポイントが30秒後にタイムアウト",High,Backend,janedoe
"レイアウト崩れ","IE11 でダッシュボードのレイアウトが崩れる",Normal,Frontend,
```

```bash
# バグをインポート
/bl:issue-bulk-create bugs.csv --type Bug
```

**出力**：
```
📂 読み込み中：bugs.csv
📊 3 件の課題を作成します

課題を作成中...
[███████████] 3/3 (100%)

✅ 作成成功：3 件の課題
📋 作成された課題キー：MYPRJ-200 ～ MYPRJ-202
```

#### 2. 優先度の高いバグを取得

```bash
# 次の重要なバグを取得
/bl:next --type Bug --priority High --count 1
```

#### 3. 調査を開始

```bash
# バグの作業を開始
/bl:issue-start MYPRJ-200 --assignee-me --comment "モバイルログイン問題を調査中"
```

#### 4. 調査結果を更新

```bash
# 調査メモを追加
/bl:issue-comment MYPRJ-200 "根本原因：モバイル Safari でクッキーが設定されていない。修正をテスト中。"
```

#### 5. ブロック状態にマーク（必要に応じて）

```bash
# 外部依存でブロックされた場合
/bl:issue-update MYPRJ-200 --status Blocked --add-comment "API チームが CORS を有効にするまで待機中"

# すべてのブロック中の課題を確認
/bl:blocked
```

#### 6. ブロック解除して継続

```bash
# ブロック解除後に再開
/bl:issue-update MYPRJ-200 --status "処理中" --add-comment "CORS 有効化完了、修正を継続"
```

#### 7. 修正したバグをクローズ

```bash
# 検証後にクローズ
/bl:issue-close MYPRJ-200 --resolution Fixed --comment "モバイル Safari のクッキー処理を修正。iOS 15+16 でテスト済み。"
```

---

## スプリント計画

マイルストーンを使用したスプリント作業の計画と追跡。

### ステップバイステップ

#### 1. スプリントマイルストーンを作成

```bash
# 2週間スプリントを作成
/bl:milestone-create "Sprint 2025-Q1-01" \
  --description "2025年Q1の第1スプリント" \
  --start-date 2025-01-15 \
  --due-date 2025-01-29
```

#### 2. スプリントバックログを作成

`sprint-backlog.csv`を作成：
```csv
title,description,type,priority,assignee,estimatedHours
"ユーザーダッシュボード","分析ダッシュボードを作成",Feature,High,johndoe,16
"API レート制限","レート制限を実装",Task,Normal,janedoe,8
"モバイルナビゲーション修正","モバイルでナビゲーションが壊れている",Bug,High,bobsmith,4
```

```bash
# スプリントタスクをインポート
/bl:issue-bulk-create sprint-backlog.csv --milestone "Sprint 2025-Q1-01"
```

#### 3. スプリント課題をマイルストーンに割り当て

```bash
# 既存の課題をスプリントに割り当て
/bl:milestone-assign "Sprint 2025-Q1-01" MYPRJ-150 MYPRJ-151 MYPRJ-152
```

#### 4. 日次進捗追跡

```bash
# 朝：今日のフォーカスを取得
/bl:next --milestone "Sprint 2025-Q1-01" --assignee me --count 3

# 日中：課題を更新
/bl:issue-start MYPRJ-150 --assignee-me
/bl:issue-comment MYPRJ-150 "50% 完了 - ダッシュボードレイアウト完成"

# 終業時：完了課題をクローズ
/bl:issue-close MYPRJ-150 --resolution Fixed
```

#### 5. スプリントステータス

```bash
# スプリント進捗を確認
/bl:status --milestone "Sprint 2025-Q1-01"
```

**出力**：
```
📊 マイルストーンステータス：Sprint 2025-Q1-01
期限：2025-01-29（残り5日）

進捗：
[████████████████░░░░] 80% 完了（24/30 課題）

⚠️ リスク評価：🟡 リスクあり
  - バーンレート：3.2 課題/日
  - 必要レート：1.2 課題/日
  - バッファ：2日

優先課題：
  1. MYPRJ-160：重要な統合テスト
  2. MYPRJ-161：パフォーマンス最適化
```

---

## デイリースタンドアップ

デイリースタンドアップレポートの生成と進捗追跡。

### 朝のルーティン

```bash
# 1. 昨日の進捗を確認
/bl:standup --days 1

# 2. 今日の推奨タスクを取得
/bl:next --assignee me --count 5

# 3. ブロッカーを確認
/bl:blocked --assignee me

# 4. 全体のステータスを確認
/bl:status
```

**スタンドアップ出力例**：
```
📅 デイリースタンドアップレポート - 2025-01-10
👤 ユーザー：johndoe

✅ 昨日完了：
  - MYPRJ-123：JWT ミドルウェアを実装
  - MYPRJ-124：ログインエンドポイントを追加

🔄 処理中：
  - MYPRJ-125：トークンリフレッシュロジック（75% 完了）
  - MYPRJ-126：ユーザーロール管理（開始したばかり）

⚠️ ブロック中：
  （なし）

📋 今日の予定：
  🎯 MYPRJ-125：トークンリフレッシュを完了
  🎯 MYPRJ-127：統合テストを開始

💬 コメント合計：8件
```

### 作業中

```bash
# 最初のタスクを開始
/bl:issue-start MYPRJ-125 --assignee-me

# 進捗更新を追加
/bl:issue-comment MYPRJ-125 "トークンリフレッシュロジック完了、テスト作成中"

# 必要に応じてタスクを切り替え
/bl:issue-update MYPRJ-125 --add-comment "コードレビューのため一時停止"
/bl:issue-start MYPRJ-127 --assignee-me
```

### 終業時

```bash
# 完了課題をクローズ
/bl:issue-close MYPRJ-125 --resolution Fixed --comment "トークンリフレッシュをテスト付きで完了"

# 処理中の課題を更新
/bl:issue-comment MYPRJ-127 "統合テスト60%完了、明日継続"

# サマリーを生成
/bl:standup --days 1
```

---

## リリース管理

マイルストーンとバージョン追跡を使用したリリース管理。

### リリース前

```bash
# 1. リリースマイルストーンを作成
/bl:milestone-create "v1.0.0" \
  --description "初回メジャーリリース" \
  --due-date 2025-02-01

# 2. マイルストーンの進捗を確認
/bl:status --milestone v1.0.0

# 3. ブロッカーを特定
/bl:issue-list --milestone v1.0.0 --status Open --priority High

# 4. 残りの課題をクローズ
/bl:next --milestone v1.0.0 --count 10
```

### リリース日

```bash
# 1. すべての課題がクローズされたことを確認
/bl:status --milestone v1.0.0

# 2. リリースノート課題を作成
/bl:issue-create \
  --title "リリース v1.0.0 ノート" \
  --type Task \
  --milestone v1.0.0 \
  --description "$(cat release-notes.md)"

# 3. リリース課題を更新
/bl:issue-comment RELEASE-ISSUE "本番環境にリリース完了"
```

### リリース後

```bash
# 1. 次のマイルストーンを作成
/bl:milestone-create "v1.1.0" --due-date 2025-06-01

# 2. 未完了の課題を移動
/bl:milestone-assign "v1.1.0" MYPRJ-180 MYPRJ-181

# 3. 次のイテレーションの計画を開始
/bl:status --milestone v1.1.0
```

---

## ベストプラクティス

### 1. 毎セッション開始時

```bash
/bl:project-info    # プロジェクトコンテキストを確認
/bl:next            # 推奨タスクを取得
/bl:status          # 全体の進捗を確認
```

### 2. 課題を最新に保つ

```bash
# 作業開始時
/bl:issue-start <key> --assignee-me

# 作業中
/bl:issue-comment <key> "進捗更新"

# 完了時
/bl:issue-close <key> --resolution Fixed
```

### 3. マイルストーンを使用

```bash
# 関連作業をグループ化
/bl:milestone-create "機能 X"
/bl:milestone-assign "機能 X" <issue_keys...>

# 進捗を追跡
/bl:status --milestone "機能 X"
```

### 4. 定期的なステータス確認

```bash
# 毎日
/bl:standup --days 1
/bl:next

# 毎週
/bl:status
/bl:blocked
```

---

## 次のステップ

- [コマンドリファレンス](../README.ja.md#コマンドリファレンス)で全コマンドを確認
- [セットアップガイド](./setup.ja.md)で設定オプションを確認
- [SPECIFICATION.md](../SPECIFICATION.md)で技術詳細を確認

---

## サポート

- 📚 [ドキュメント](../README.ja.md)
- 🐛 [課題を報告](https://github.com/bellsanct/cc-backlog/issues)
- 💬 [ディスカッション](https://github.com/bellsanct/cc-backlog/discussions)
