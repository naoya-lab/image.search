const ALLOWED_ORIGINS = new Set([
  'https://naoya-lab.github.io',
  'http://localhost:8000',
  'http://127.0.0.1:8000',
]);

// Keep in sync with the registered trigger vocabulary in ../index.html.
export const CANONICAL_TERMS = new Set([
  "急性脳梗塞", "脳梗塞疑い", "脳卒中", "構音障害", "片麻痺", "神経症状", "最終健常",
  "頭部打撲", "頭部外傷", "頭蓋骨骨折", "転倒", "腰椎椎間板ヘルニア", "椎間板ヘルニア", "坐骨神経痛",
  "神経根症", "胆道", "胆管", "胆石", "肺血栓塞栓症", "肺塞栓", "肺動脈血栓",
  "深頸部感染", "深頸部膿瘍", "市中肺炎", "肺炎鑑別", "非感染性肺疾患", "冠動脈CTA", "冠動脈CT",
  "冠動脈狭窄", "子宮頸癌", "子宮頸がん", "頸癌", "上部尿路腫瘍", "尿路上皮腫瘍", "CT urography",
  "骨軟部腫瘍", "軟部腫瘍", "骨腫瘍", "乳癌術前", "乳腺病変", "造影乳房MRI", "有熱時けいれん",
  "熱性けいれん", "くも膜下出血", "くも膜下出血疑い", "SAH", "破裂脳動脈瘤", "脳内出血", "脳出血",
  "急性期脳内出血", "脳実質内出血", "頭蓋内出血", "脳転移", "転移性脳腫瘍", "脳転移疑い", "頸椎症性脊髄症",
  "頚椎症性脊髄症", "頸髄症", "頚髄症", "急性胆管炎", "胆管炎", "急性胆管炎疑い", "急性膵炎",
  "膵炎", "膵炎重症度判定", "膵癌", "膵がん", "膵腫瘍", "膵癌疑い", "肝腫瘍",
  "肝細胞癌", "肝癌", "HCC", "肝腫瘤", "腎腫瘍", "腎癌", "腎細胞癌",
  "腎腫瘤", "尿路結石", "尿管結石", "腎結石", "尿路結石疑い", "腎疝痛", "前立腺癌",
  "前立腺がん", "前立腺腫瘍", "前立腺MRI", "頭痛", "頭痛精査", "頭痛増悪", "片頭痛",
  "緊張型頭痛", "頭重感", "頭部痛", "後頭部痛", "前頭部痛", "側頭部痛", "頭が痛い",
  "頭の痛み", "頭がズキズキする", "頭がガンガンする", "頭が重い", "頭が痛む", "頭痛が続く", "頭が割れるように痛い",
  "こめかみの痛み", "後頭部が痛い", "前頭部が痛い", "頭頂部痛", "頭頂部が痛い", "頭部の痛み", "急な頭痛",
  "突然の頭痛", "雷鳴頭痛", "頭痛あり", "低酸素血症", "酸素化不良", "酸素化低下", "低酸素",
  "SpO2低下", "酸素飽和度低下", "呼吸困難", "息切れ", "SpO2低値", "酸素需要増加", "酸素投与量増加",
  "呼吸状態悪化", "酸素化が悪い", "酸素が足りない", "酸素が低い", "酸素飽和度低値", "SpO2が低い", "酸素必要量増加",
  "酸素投与量が増えた", "息苦しい", "息が苦しい", "息がしづらい", "呼吸が苦しい", "呼吸苦", "腰痛",
  "腰部痛", "下肢痛", "下肢放散痛", "腰坐骨神経痛", "下肢しびれ", "下肢のしびれ", "腰から足にかけての痛み",
  "腰が痛い", "腰が痛む", "腰の痛み", "腰背部痛", "背部痛", "背中が痛い", "背中の痛み",
  "足の痛み", "脚の痛み", "足がしびれる", "脚がしびれる", "足のしびれ", "脚のしびれ", "足に痛みがある",
  "脚に痛みがある", "腰から脚に放散する痛み", "胸痛", "胸部痛", "胸が痛い", "胸の痛み", "胸部圧迫感",
  "胸が締め付けられる", "胸が苦しい", "胸苦しさ", "腹痛", "腹部痛", "お腹が痛い", "おなかが痛い",
  "腹部の痛み", "みぞおちの痛み", "心窩部痛", "下腹部痛", "右下腹部痛", "左下腹部痛", "腹部不快感",
  "腹部膨満感", "腹部膨満", "悪心", "嘔気", "吐き気", "嘔吐", "発熱",
  "熱がある", "熱が続く", "高熱", "微熱", "原因不明の発熱", "めまい", "ふらつき",
  "意識障害", "意識レベル低下", "意識混濁", "失神", "意識がもうろうとする", "手足のしびれ", "四肢しびれ",
  "脱力", "力が入らない", "頸部痛", "頚部痛", "首の痛み", "首が痛い", "肩痛",
  "肩の痛み", "肩が痛い", "関節痛", "膝痛", "膝の痛み", "股関節痛", "股関節の痛み",
  "関節腫脹", "四肢痛", "突然の激しい頭痛", "今までで最悪の頭痛", "人生最悪の頭痛", "急に起きた激しい頭痛", "急性腎盂腎炎",
  "腎盂腎炎", "腎盂腎炎疑い", "急性胆嚢炎", "急性胆嚢炎疑い", "胆嚢炎", "胆嚢炎疑い", "Murphy徴候",
  "Murphyサイン", "右季肋部痛", "右上腹部痛", "妊娠中", "妊婦", "妊娠", "急性腹症",
  "妊娠中の腹痛", "妊婦の腹痛", "妊娠中の急性腹症", "妊婦の急性腹症", "Adamkiewicz動脈", "アダムキュービッツ動脈", "大前根髄動脈",
  "胸部大動脈瘤", "胸腹部大動脈瘤", "術前", "大動脈瘤術前", "ステントグラフト内挿術", "RCVS", "可逆性脳血管攣縮症候群",
  "雷鳴頭痛で発症", "脳血管攣縮", "動脈解離", "脳動脈解離", "頭蓋内動脈解離", "椎骨動脈解離", "頸動脈解離",
  "頚動脈解離", "解離性動脈瘤", "脳静脈洞血栓症", "静脈洞血栓", "脳静脈血栓症", "皮質静脈血栓症", "CVT",
  "側頭葉てんかん", "側頭葉てんかん疑い", "難治性側頭葉てんかん", "てんかん焦点精査", "アルツハイマー病", "アルツハイマー型認知症", "認知症精査",
  "MCI", "軽度認知障害", "ARIA", "アミロイド関連画像異常", "レカネマブ", "ドナネマブ", "抗Aβ抗体療法",
  "小児頭部外傷", "小児頭部打撲", "子どもの頭部外傷", "小児軽症頭部外傷", "小児の頭を打った", "先天性難聴", "小児難聴",
  "内耳奇形", "聴覚障害の画像評価", "新生児HIE", "低酸素性虚血性脳症", "新生児低酸素性脳症", "新生児仮死後脳障害", "肝芽腫",
  "小児肝腫瘍", "肝芽腫疑い", "網膜芽細胞腫", "小児網膜芽細胞腫", "眼球内腫瘍 小児", "神経芽腫", "小児神経芽腫",
  "神経芽腫病期診断", "がん素因症候群", "Cancer predisposition syndrome", "Li-Fraumeni症候群", "リー・フラウメニ症候群", "腎芽腫", "Wilms腫瘍",
  "ウィルムス腫瘍", "小児腎腫瘍", "胎児MRI", "胎児のMRI", "胎児画像診断", "出生前MRI", "乳児肋骨骨折",
  "虐待疑い 肋骨骨折", "子ども虐待 肋骨骨折", "非偶発性外傷", "副腎腺腫", "副腎偶発腫", "副腎腫瘤", "副腎結節",
  "膀胱癌", "膀胱がん", "膀胱腫瘍", "膀胱筋層浸潤", "膀胱癌深達度", "精巣癌", "精巣がん",
  "精巣腫瘍", "精巣癌病期診断", "副鼻腔炎", "慢性副鼻腔炎", "急性副鼻腔炎", "副鼻腔炎合併症", "頭頸部癌",
  "頭頸部がん", "口腔癌", "咽頭癌", "喉頭癌", "頭頸部癌リンパ節転移", "耳下腺腫瘍", "耳下腺腫瘤",
  "耳下腺癌", "偶発甲状腺結節", "甲状腺結節", "CTで甲状腺腫瘤", "甲状腺偶発腫", "COPD", "慢性閉塞性肺疾患",
  "肺気腫", "閉塞性肺疾患", "呼気CT", "特発性肺線維症", "IPF", "間質性肺炎", "間質性肺疾患",
  "肺線維症", "薬剤性肺障害", "薬剤性肺炎", "薬剤性間質性肺炎", "薬剤性肺臓炎", "肺結節", "肺腫瘤",
  "孤立性肺結節", "すりガラス結節", "肺癌疑い", "肺癌", "肺がん", "肺癌病期診断", "肺癌脳転移",
  "肺癌リンパ節転移", "縦隔腫瘍", "縦隔腫瘤", "胸膜腫瘍", "胸膜病変", "悪性胸膜中皮腫", "急性虫垂炎",
  "虫垂炎", "虫垂炎疑い", "右下腹部痛 虫垂炎", "腸閉塞", "イレウス", "小腸閉塞", "大腸閉塞",
  "大腸憩室炎", "憩室炎", "憩室炎疑い", "左下腹部痛 憩室炎", "大腸癌", "大腸がん", "直腸癌",
  "直腸がん", "大腸癌病期診断", "子宮筋腫", "子宮腺筋症", "筋腫精査", "子宮腫瘤", "子宮内膜症",
  "卵巣子宮内膜症性嚢胞", "チョコレート嚢胞", "深部子宮内膜症", "卵巣腫瘤", "付属器腫瘤", "卵巣腫瘍", "卵巣嚢胞",
  "付属器腫瘍", "子宮体癌", "子宮体がん", "子宮内膜癌", "子宮内膜がん", "関節リウマチ", "手関節炎",
  "滑膜炎", "RA手関節", "腱板損傷", "腱板断裂", "肩関節唇損傷", "関節唇損傷", "肩関節脱臼後",
  "大腿骨頭壊死", "特発性大腿骨頭壊死症", "大腿骨頭壊死疑い", "骨頭壊死", "半月板損傷", "前十字靱帯損傷", "ACL損傷",
  "後十字靱帯損傷", "膝靱帯損傷", "心筋症", "肥大型心筋症", "心アミロイドーシス", "心サルコイドーシス", "ファブリー病",
  "心筋炎", "T1マッピング", "エンドリーク", "endoleak", "EVAR後", "TEVAR後", "ステントグラフト術後",
  "心筋虚血", "安定狭心症", "冠動脈疾患", "心筋CT perfusion", "心筋perfusion MRI", "慢性肝疾患", "肝硬変",
  "サーベイランス", "EOB-MRI", "肝内胆管癌", "胆管癌", "造影CT", "肝転移", "転移性肝腫瘍",
  "慢性膵炎", "膵石", "膵管拡張", "MRCP", "CT", "膵神経内分泌腫瘍", "膵NET",
  "膵NEN", "MRI", "胆嚢癌", "胆嚢腫瘍", "胆嚢", "肝外胆管癌", "胆道癌",
  "肝外転移", "病期", "小径腎腫瘍", "監視療法", "bpMRI", "造影MRI", "拡散強調像",
  "T2強調像", "子宮肉腫", "ADC", "mpMRI", "婦人科悪性腫瘍", "婦人科癌", "卵巣癌",
  "子宮癌", "FDG-PET/CT", "癒着胎盤", "胎盤早期剥離", "前置血管", "胎盤腫瘍", "胎盤MRI",
  "子宮頸部嚢胞", "ナボット嚢胞", "子宮頸部嚢胞性病変", "骨盤MRI", "肘関節", "肘MRI", "肘靱帯損傷",
  "肘腱損傷", "骨軟骨病変", "手関節MRI", "手MRI", "手指MRI", "手関節", "靱帯損傷",
  "足関節MRI", "足首MRI", "足関節", "足部MRI", "足関節靱帯損傷", "じん肺", "塵肺",
  "職業性肺疾患", "胸部CT", "HRCT", "air trapping"
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
    if (!env.GEMINI_API_KEY) return json({ error: 'WorkerにGEMINI_API_KEYが設定されていません。Google AI StudioのGemini APIキーをCloudflare Secretとして登録してください。' }, 503, origin);

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
      '同義語・略語・漢字/かな/全半角などの表記差を広く扱い、単語の完全一致だけを要求しません。迷う場合はmatchesを空にします。',
      '症状の言い換えは同じ症状の登録語へ対応づけます。症状から病名・原因・撮像の要否へ言い換えることは禁止です。',
      '典型例:「頭がズキズキする」→「頭痛」、「胸が締め付けられる」→「胸痛」、「お腹が痛い」→「腹痛」、「息が苦しい」→「呼吸困難」、「SpO2が下がっている」→「SpO2低下」、「腰が痛い」→「腰痛」、「脚がしびれる」→「下肢のしびれ」、「首が痛い」→「頸部痛」、「熱が続く」→「発熱」。',
      '候補用語は同じ意味が本文から明確な場合だけ選び、複数候補なら本文が直接支える最も具体的な用語だけを選びます。否定・疑い・既往の区別を保持します。',
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
            maxOutputTokens: 800,
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
