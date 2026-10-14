const ALLOWED_ORIGINS = new Set([
  'https://naoya-lab.github.io',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
]);

// Keep in sync with the registered trigger vocabulary in ../index.html.
export const CANONICAL_TERMS = new Set([
  '急性脳梗塞', '脳梗塞疑い', '脳卒中', '構音障害', '片麻痺', '最終健常', '急性', '神経症状',
  '頭部打撲', '頭部外傷', '頭蓋内出血', '頭蓋骨骨折', '転倒', '頭部', '腰椎椎間板ヘルニア',
  '椎間板ヘルニア', '坐骨神経痛', '神経根症', '胆道', '胆管', '胆石', '胆嚢', '右季肋部',
  '肺血栓塞栓症', '肺塞栓', '肺動脈血栓', '深頸部感染', '深頸部膿瘍', '市中肺炎', '肺炎鑑別',
  '非感染性肺疾患', '冠動脈CTA', '冠動脈CT', '冠動脈狭窄', '子宮頸癌', '子宮頸がん', '頸癌',
  '上部尿路腫瘍', '尿路上皮腫瘍', 'CT urography', '骨軟部腫瘍', '軟部腫瘍', '骨腫瘍',
  '乳癌術前', '乳腺病変', '造影乳房MRI', '有熱時けいれん', '熱性けいれん',
  'くも膜下出血',
  'くも膜下出血疑い',
  'SAH',
  '破裂脳動脈瘤',
  '脳内出血',
  '脳出血',
  '急性期脳内出血',
  '脳実質内出血',
  '脳転移',
  '転移性脳腫瘍',
  '脳転移疑い',
  '頸椎症性脊髄症',
  '頚椎症性脊髄症',
  '頸髄症',
  '頚髄症',
  '急性胆管炎',
  '胆管炎',
  '急性胆管炎疑い',
  '急性膵炎',
  '膵炎',
  '膵炎重症度判定',
  '膵癌',
  '膵がん',
  '膵腫瘍',
  '膵癌疑い',
  '肝腫瘍',
  '肝細胞癌',
  '肝癌',
  'HCC',
  '肝腫瘤',
  '腎腫瘍',
  '腎癌',
  '腎細胞癌',
  '腎腫瘤',
  '尿路結石',
  '尿管結石',
  '腎結石',
  '尿路結石疑い',
  '腎疝痛',
  '前立腺癌',
  '前立腺がん',
  '前立腺腫瘍',
  '前立腺MRI',
  '頭痛',
  '頭痛精査',
  '頭痛増悪',
  '片頭痛',
  '緊張型頭痛',
  '頭重感',
  '低酸素血症',
  '酸素化不良',
  '酸素化低下',
  '低酸素',
  'SpO2低下',
  '酸素飽和度低下',
  '呼吸困難',
  '息切れ',
  '頭部痛',
  '後頭部痛',
  '前頭部痛',
  '側頭部痛',
  '頭が痛い',
  '頭の痛み',
  'SpO2低値',
  '酸素需要増加',
  '酸素投与量増加',
  '呼吸状態悪化',
  '腰痛',
  '腰部痛',
  '下肢痛',
  '下肢放散痛',
  '腰坐骨神経痛',
  '下肢しびれ',
  '腰から足にかけての痛み',
]);

const corsHeaders = (origin) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  'Vary': 'Origin',
});

function json(data, status, origin) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(origin),
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function normalize(value) {
  return value.normalize('NFKC').toLocaleLowerCase('ja-JP');
}

function extractOutputText(payload) {
  const parts = payload.candidates?.[0]?.content?.parts || [];
  return parts.filter((part) => typeof part.text === 'string').map((part) => part.text).join('');
}

function validateMatches(value, sourceText) {
  if (!value || !Array.isArray(value.matches)) return [];
  const normalizedSource = normalize(sourceText);
  const clean = value.matches.flatMap((item) => {
    if (!item || typeof item.sourcePhrase !== 'string' || typeof item.canonicalTerm !== 'string') return [];
    const sourcePhrase = item.sourcePhrase.trim().slice(0, 100);
    const canonicalTerm = item.canonicalTerm.trim();
    if (!sourcePhrase || !CANONICAL_TERMS.has(canonicalTerm)) return [];
    // Only accept phrases literally present in the submitted text; never invent source wording.
    if (!normalizedSource.includes(normalize(sourcePhrase))) return [];
    return [{ sourcePhrase, canonicalTerm }];
  });
  return [...new Map(clean.map((item) => [`${item.sourcePhrase}\u0000${item.canonicalTerm}`, item])).values()].slice(0, 20);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    if (!ALLOWED_ORIGINS.has(origin)) return new Response('Forbidden', { status: 403 });

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/normalize') {
      return json({ error: 'このURLではPOST /normalizeのみ利用できます。' }, 404, origin);
    }
    if (!request.headers.get('Content-Type')?.toLowerCase().includes('application/json')) {
      return json({ error: 'Content-Typeはapplication/jsonにしてください。' }, 415, origin);
    }

    const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
    const rate = await env.AI_RATE_LIMITER.limit({ key: clientIp });
    if (!rate.success) return json({ error: '利用回数の上限に達しました。1分ほど待って再試行してください。' }, 429, origin);

    let body;
    try {
      const raw = await request.text();
      if (raw.length > 12000) return json({ error: '依頼文が長すぎます。短くして再試行してください。' }, 413, origin);
      body = JSON.parse(raw);
    } catch {
      return json({ error: 'JSON形式のリクエストを確認してください。' }, 400, origin);
    }
    const text = typeof body.text === 'string' ? body.text.trim() : '';
    if (!text || text.length > 4000) return json({ error: '依頼文は1〜4000文字で入力してください。' }, 400, origin);
    if (!env.GEMINI_API_KEY) return json({ error: 'WorkerにGEMINI_API_KEYが設定されていません。CloudflareのSecretsを確認してください。' }, 503, origin);

    const responseSchema = {
      type: 'OBJECT',
      properties: {
        matches: {
          type: 'ARRAY',
          items: {
            type: 'OBJECT',
            properties: {
              sourcePhrase: { type: 'STRING' },
              canonicalTerm: { type: 'STRING', enum: [...CANONICAL_TERMS] },
            },
            required: ['sourcePhrase', 'canonicalTerm'],
          },
        },
      },
      required: ['matches'],
    };
    const instructions = [
      'あなたは日本語の放射線検査依頼文に含まれる表記ゆれを正規化する補助器です。',
      '役割は、依頼文に実際に書かれた語句を、提示された登録用語のうち同じ意味の語へ対応づけることだけです。',
      '症状から病態・診断を推測してはいけません。症状を病名へ、病名を症状へ変換してはいけません。',
      '否定、除外、既往、家族歴、可能性の低い鑑別など、文脈が曖昧な語は対応づけず除外してください。',
      'sourcePhraseは入力本文にそのまま含まれる短い部分文字列にしてください。OCR誤りを補完したり、本文にない表現を作らないでください。',
      '同義語・略語・漢字/かな/全半角などの表記差だけを扱います。迷う場合はmatchesを空にします。',
      '候補用語は許可リスト内からのみ選んでください。診断、検査適応、プロトコル、緊急度は出力しません。',
    ].join('\n');

    let upstream;
    try {
      upstream = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent', {
        method: 'POST',
        headers: {
          'x-goog-api-key': env.GEMINI_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: instructions }] },
          contents: [{
            role: 'user',
            parts: [{ text: `登録済み用語:\n${[...CANONICAL_TERMS].join('、')}\n\n依頼文:\n${text}` }],
          }],
          generationConfig: {
            temperature: 0,
            maxOutputTokens: 500,
            responseMimeType: 'application/json',
            responseSchema,
          },
        }),
      });
    } catch {
      return json({ error: 'AIサービスに接続できませんでした。時間をおいて再試行してください。' }, 502, origin);
    }
    if (!upstream.ok) {
      const message = upstream.status === 429
        ? 'Gemini APIの利用上限に達した可能性があります。AI Studioの利用量を確認してください。'
        : `Gemini APIがリクエストを拒否しました（HTTP ${upstream.status}）。APIキー、モデル、利用設定を確認してください。`;
      return json({ error: message }, 502, origin);
    }

    let result;
    try {
      const response = await upstream.json();
      const outputText = extractOutputText(response);
      if (!outputText) throw new Error('No structured text output');
      result = JSON.parse(outputText);
    } catch {
      return json({ error: 'AIの応答を読み取れませんでした。もう一度お試しください。' }, 502, origin);
    }
    return json({ matches: validateMatches(result, text) }, 200, origin);
  },
};
