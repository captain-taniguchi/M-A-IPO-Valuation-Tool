# Claude Code プロジェクト開発ガイドライン

## プロジェクト概要
投資銀行業務向けのバリュエーションツール。ROE、ROA等の基本的な財務指標計算とDCF法、マルチプル法によるバリュエーション機能を提供。

## 開発履歴

### 2025-09-27 初期開発
1. **プロジェクト作成**
   - Next.js 15 + TypeScript + Tailwind CSS環境構築
   - 投資銀行業務に必要な基本機能を実装

2. **実装した主要機能**
   - ダッシュボード：全体サマリー表示
   - 財務指標計算：ROE、ROA、ROIC、EPS等
   - DCF法：将来キャッシュフロー割引による企業価値評価
   - マルチプル法：PER、PBR、EV/EBITDAによる相対評価
   - リアルタイム分析：EDINET API連携による実企業データ取得

3. **ユーザビリティ向上**
   - 初心者向けツールチップシステム実装
   - 日本語での詳細な用語・数式説明
   - レスポンシブデザイン対応

4. **API最適化**
   - キャッシュ機能（5分間）
   - タイムアウト設定（3秒）
   - 並列データ取得
   - モックデータフォールバック

## エラー対処履歴

### Tailwind CSS PostCSSエラー
```bash
npm install --save-dev tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.17
```

### TypeScript重複変数名エラー
- `logMessage`変数名の重複を修正
- 各関数で一意の変数名に変更（`startLogMessage`、`searchLogMessage`等）

### JSX構文エラー
- `<input`タグの不完全な記述を修正

### webpack実行時エラー
- 類似企業分析機能の循環参照が原因
- IntegratedValuationコンポーネントを一時的に無効化で解決

## 開発ルール

### コーディング規約
1. **エラーハンドリング**
   - すべての外部API呼び出しにtry-catchを実装
   - タイムアウト処理を必須とする
   - ユーザーフレンドリーなエラーメッセージを表示

2. **パフォーマンス**
   - APIレスポンスは必ずキャッシュ
   - 重い処理は非同期実行
   - UIブロッキングを避ける

3. **型安全性**
   - TypeScriptの厳格な型定義
   - any型の使用を極力避ける
   - インターフェース定義を明確に

### ファイル構成
```
valuation-tool/
├── app/              # Next.js App Router
├── components/       # Reactコンポーネント
├── lib/             # ユーティリティ・計算ロジック
└── scripts/         # ビルド・チェックスクリプト
```

### 重要な設定

#### package.json
- `predev`スクリプト：開発前のエラーチェック
- エラーが頻発する場合は一時的に無効化可能

#### エラーチェック機構
```bash
npm run check  # TypeScript型チェック、構文チェック、ビルドテスト
```

### API制限と対策

#### EDINET API
- 無料・APIキー不要
- XBRL解析にはサーバーサイド処理が必要
- レート制限なし（ただし負荷を考慮）

#### TDnet
- 公式APIなし
- プロキシ経由でのアクセスが必要
- リアルタイムデータ取得は技術的に困難

### トラブルシューティング

#### サーバーが起動しない
1. ポートが使用中か確認
   ```bash
   netstat -ano | findstr :3000
   taskkill //F //PID [プロセスID]
   ```
2. Next.jsキャッシュクリア
   ```bash
   rmdir /s /q .next
   ```

#### Internal Server Error
1. エラーログを確認
2. TypeScriptのビルドエラーをチェック
3. 最悪の場合、git resetで正常動作時に戻す

### 今後の改善案
- [ ] 類似企業分析機能の再実装（循環参照を解消）
- [ ] 実際のEDINET APIデータ取得（現在はモックデータ）
- [ ] より高度なバリュエーション手法の追加
- [ ] エクスポート機能（Excel、PDF）
- [ ] マルチユーザー対応

## コマンド一覧
```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# エラーチェック
npm run check

# Git操作
git add .
git commit -m "メッセージ"
git push origin master
```

## 注意事項
- API呼び出しは必ず最適化版（`api-optimized.ts`）を使用
- 新機能追加時は必ずエラーチェックスクリプトを実行
- パフォーマンスに影響する変更は慎重に検討