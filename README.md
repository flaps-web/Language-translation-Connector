# Language translation Connector

クロムベースのブラウザで英語を日本語に変換する機能拡張です。Local LLM への接続と OpenAI互換 のクラウドエンドポイントに対応します。

## 特徴

- **マルチバックエンド**: Ollama LM Studio などのローカル LLM から、OpenAI や Gemini などのクラウド AI まで幅広く対応。（ただし動作確認は Gemini 2.5 Flash で行いました。）
- **軽量・高速**: ブラウザ上で動作し、ストリーミング形式での翻訳表示によりレスポンスを待たずに翻訳結果を確認できます。
- **カスタマイズ**: 翻訳を開始する最小文字数、モデルのパラメータ（Temperature, Max Tokens等）をユーザー設定から自由に変更可能。

## インストール方法

1.  このリポジトリをクローンまたはダウンロードします。
2.  Google Chrome 等のブラウザで `chrome://extensions` を開きます。
3.  「デベロッパー モード」をオンにします。
4.  「パッケージ化されていない拡張機能を読み込む」をクリックし、このプロジェクトのフォルダを選択します。

## 設定方法

拡張機能の管理画面から「オプション」を開き、以下の設定を行ってください。

### 1. ローカル LLM (Ollama 等) を使用する場合
- **API Endpoint URL**: `http://localhost:11434/v1/chat/completions` (Ollamaの場合)
- **API Key**: 空欄
- **Model Name**: 使用するモデル名 (例: `gemma-transrate@q8_0`)

### 2. クラウド AI (Gemini / OpenAI) を使用する場合
- **API Endpoint URL**: 
  - Gemini: `https://generativelanguage.googleapis.com/v1beta/openai/chat/completions`
  - OpenAI: `https://api.openai.com/v1/chat/completions`
- **API Key**: 各サービスで取得した API キー
- **Model Name**: 使用するモデル名 (例: `gemini-2.0-flash`, `gpt-4o`)

## 使い方

1.  ウェブページ上のテキストの英文を選択します。
2.  選択範囲の下に翻訳結果のポップアップがリアルタイムで表示されます。
3.  ポップアップ以外の場所をクリックするとウインドウは消去されます。

## ライセンス

MIT License
