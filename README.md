# Imaging Assist

CT・MRIの依頼文をもとに、病態と撮影プロトコルの確認候補を表示するUIの試作です。通常のキーワード検索とOCRはブラウザ内で処理します。任意のAI表記整理機能には、別途Cloudflare WorkerとGemini APIの設定が必要です。

## 起動

`index.html` をブラウザで開きます。通常のキーワード検索・OCRにサーバーは不要です。AI表記整理は下記のWorker設定後に使えます。

## 現在の動作

- 入力中の依頼文のキーワードから登録済みルールを自動検索（手動の再解析ボタンも使用可能）
- 病態候補、プロトコル候補、実施前の確認項目を表示
- CT/MRIと全身の撮影部位で絞り込み（未登録部位は日本医学放射線学会ガイドラインの検索へ案内）
- 登録済み候補に、参照した画像診断ガイドライン記事と確認日を表示
- サンプル入力、クリア操作
- 手入力に加え、カメラ撮影または画像ファイルから日本語・英語OCR
- OCR結果を依頼文欄へ反映し、利用者が確認・修正してから解析
- カメラは操作時だけ起動し、撮影後または画面を離れると停止
- 読み込んだ画像をサーバーへ送らない（OCRエンジンと日本語データは初回にCDNから取得）
- 任意のAI表記整理：登録済みトリガー用語への言い換え案を提示し、利用者が選んだ語だけを候補検索へ追加（依頼文原文は変更しない）

## 大切な制約

この試作はキーワード一致による参考表示のみで、診断支援や検査・条件の自動決定を行うものではありません。AIは登録済み用語への言い換え案だけを作りますが、誤対応・見逃しがありえます。提案は自動適用されず、原文を確認して利用者が選択します。AI機能を使う場合、依頼文テキストは設定した外部AIサービスへ送信されます。患者氏名・IDなどの個人情報は送信しないでください。入力内容はこのアプリ内では保存しませんが、外部サービスの取り扱いは各サービスの契約・設定に従います。表示ルールはガイドラインの網羅的な実装ではなく、部位によって未登録のものがあります。OCRは誤読することがあり、原文照合が必要です。候補の網羅性や安全性は検証されていません。実運用には、施設承認済みプロトコル、根拠文献、禁忌・緊急時確認、臨床安全性と情報管理の検証が必要です。

## AI表記整理の設定（任意）

GitHub Pagesは静的サイトです。Gemini APIキーをHTMLやブラウザ設定に書くと公開されるため、Cloudflare Workerを中継に使います。WorkerのキーはCloudflare Secretに保管し、ブラウザには渡しません。APIの構造化出力で登録語との対応だけを受け取り、Workerとブラウザの両方で許可語と入力文字列を検証します。

### Workerの初回デプロイ

1. OpenAIのAPIキーを用意します。キーはGitHubへ登録・貼り付けしないでください。
2. Google AI StudioでGemini APIキーを作成します。Cloudflare WorkerのSecret名は `GEMINI_API_KEY` にしてください（既存Secretが `OPENAI_API_KEY` という名前の場合、Workerからは読み取れません）。Node.jsをインストールした端末でこのリポジトリを取得し、ターミナルで `ai-worker` フォルダへ移動します。
3. 次を順に実行します。

   ```sh
   npm install
   npx wrangler login
   npx wrangler deploy
   npx wrangler secret put GEMINI_API_KEY
   ```

   `secret put` の入力待ちになったらAPIキーを貼り付けます。WorkerのURLは `npx wrangler deploy` の出力に表示されます。初回のデプロイ直後、Secretを登録するまではAI機能は使えません。

4. 公開アプリの「依頼内容を入力」欄にある「AI表記整理の接続設定」を開き、WorkerのベースURL（末尾に `/normalize` を付けない）を入力して保存します。通常のキーワード検索はWorkerなしでも利用できます。

### 制限・更新

- Workerは `https://naoya-lab.github.io` からのブラウザ通信だけを許可し、1 IPあたり毎分10回に制限します。CloudflareのRate Limitingは補助策で、利用者認証や医療情報のアクセス制御の代わりにはなりません。公開利用の前にCloudflare側の利用量・アラートも設定してください。
- AIへ送るのは依頼文テキストです。画像ファイルやOCR元画像は送信しません。AI処理を実行するたびに確認ダイアログを表示します。
- AIは同義語・略語・表記差の候補を返します。否定表現や文脈の判定は完全ではないため、AIが「否定・既往など文脈が曖昧な語は除外」と指示されていても、利用者が原文を確認してください。
- Workerの許可語は `ai-worker/src/index.js` の `CANONICAL_TERMS`、画面側は `index.html` の `rules[].trigger` です。ルール追加時は両方を同期してください。テスト `cd ai-worker && npm test` で不一致を検出します。
- Gemini APIの利用条件・クォータ・料金はGoogle AI Studio側で確認してください。モデル名は `ai-worker/src/index.js` のGemini API URLで指定しています。

## 参照資料の扱い

- 候補には日本医学放射線学会「画像診断ガイドライン」の該当記事へのリンクと確認日を付けています。画面の要約だけでなく、原文の対象条件・注意事項を確認してください。
- ガイドラインの本文・図表の転載や二次利用には、学会の許諾が必要となる場合があります。公開サービスに内容を追加する場合は、[転載許諾の案内](https://www.radiology.jp/jrs_about/reprint_permission.html)を確認してください。
- 施設固有の装置条件、シーケンス、造影条件は、施設内で承認された最新版を別途登録してください。

カメラ利用はブラウザの許可が必要です。カメラAPIは通常HTTPSまたはlocalhostなどの安全なコンテキストでのみ利用できます。

## 次の実装候補

1. 未登録の領域・疾患を、根拠と適用条件を確認しながら段階的に追加
2. 症状、部位、緊急度、禁忌などを構造化して確認
3. 施設内プロトコルをJSONで管理し、版数・承認者・更新日・出典を記録
4. 既知症例と専門家レビューで誤候補・見逃しを評価
5. 必要に応じて施設ネットワーク内だけで動く検索方式を検討

## OCR実装メモ

OCRはTesseract.js 6.0.1をブラウザで利用します。初回はライブラリと日本語・英語の学習データをダウンロードします。画像ファイル自体はOCRサーバーへアップロードしません。ネット接続やCDN利用ができない環境ではOCRを利用できないため、院内利用前に配布方法・通信許可・情報管理規則を確認してください。

- Tesseract.js: https://github.com/naptha/tesseract.js
- MDN `getUserMedia()`: https://developer.mozilla.org/ja/docs/Web/API/MediaDevices/getUserMedia
- Gemini structured output: https://ai.google.dev/gemini-api/docs/structured-output
- Cloudflare Workers Secrets: https://developers.cloudflare.com/workers/configuration/secrets/
- Cloudflare Workers Rate Limiting: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
