# 放射線技師AI v0.3 — 教育・研究用MVP

## 構成
- 静的画面: `radiographer-ai/index.html` (GitHub Pages)
- API: Cloudflare Worker `radiographer-ai-api`
- 質問の回答: OpenAI API（Workerが代理呼び出し）
- 個人トークン: Worker Secret `PERSONAL_ACCESS_TOKEN`。ブラウザで入力するが永続保存しない。
- 有料API鍵: Worker Secret `OPENAI_API_KEY`。ブラウザへ送らない。
- Rate limiter: `AI_RATE_LIMITER` 5 requests per 60 sec。コードから呼び出す。厳密な月額課金上限ではない。
- CORS: `ALLOWED_ORIGIN=https://naoya-lab.github.io`。CORSは認証ではない。

## 注意事項
- 試験版であり、医学情報・文献の検索や出典の自動検証はまだ実装されていない。
- 熟練技師と同等の判断精度は検証されていない。
- 患者氏名、ID、生年月日、検査画像、DICOM、その他識別可能な情報を入力しない。
- 入力文字列の正規表現チェックは、個人情報漏洩を完全には防げない。
- Cloudflare Accessの保護は解除済み。Workerはインターネットから到達可能で、認証にはトークンが必要。
- GitHubの `main` にあるのは現時点でフロントエンド。Worker本番コードはCloudflare側でデプロイ済み。開発版のWorkerコードは `feature/radiographer-ai-mvp` ブランチにある。
- 公開HTMLやGitHub、READMEに認証トークンやAPIキーを書かない。

## 動作確認チェックリスト
1. iPhone Safariでページを開き、質問例が表示される。
2. 空欄で送信できない。
3. キーなしなら送信前にエラーを表示する。
4. 存在しない架空のキーで 401 を返し、AIサービスへの請求が発生しないことを確認する。
5. 正しいキーで一般論の質問を送信して回答を得る。
6. 回答のコピーを確認する。
7. 60秒間に連続送信して 429 制限を確認する（必要最小限の回数で行う）。
8. ネットワーク障害でエラーが表示され、無限に送信しないことを確認する。

## 次の開発課題
1. 権限の絞られた永続的な利用者認証。トークン方式は暫定。
2. 論文・ガイドライン検索（PubMed等）と原文照合・出典日時・DOIを伴うRAG。
3. 文献による回答とAIの一般的推論を画面上で明確に区別。
4. 施設プロトコルDBは匿名化・端末／サーバ保存の条件を設計してから。
5. 知識テスト（装置差、造影剤安全、CTDI、画像物理、誤情報検知）を構築し、専門家評価する。
6. 利用量監視と予算アラート。Rate limiterだけで金額上限とはしない。
