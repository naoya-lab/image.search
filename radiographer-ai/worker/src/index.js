/**
 * Radiographer AI MVP — Cloudflare Worker
 * Required secrets/config: OPENAI_API_KEY (secret), PERSONAL_ACCESS_TOKEN (secret), ALLOWED_ORIGIN, AI_MODEL.
 * IMPORTANT: Personal token authentication is minimum protection. Add WAF rate limiting before exposure.
 * No request content is intentionally persisted.
 */
const CATEGORIES = new Set(["CT・CTA","MRI","一般撮影","透視","マンモグラフィ","画像物理・品質管理"]);
const SYSTEM = `あなたは診療放射線技師の教育・研究向け技術アシスタント。日本語で回答する。
臨床判断・装置操作・診断の最終決定は担当の有資格者が行う。実際の患者の診断や緊急対応は断定しない。
病態と検査目的、一般的選択肢、メリット・デメリット、安全上の注意、確認すべき情報を整理する。
医学文献を閲覧・照合するツールは接続されていない。論文名、DOI、ガイドラインの章節などを捏造しない。
特定の根拠を検証できない場合は「出典未検証」と明記し、公式資料での確認を促す。
医学的に不確実な点や装置固有の相違を明確にする。放射線照射・造影剤投与の具体的条件は患者個別に確定しない。
個人を特定できる情報が提示されたら、詳細を繰り返さず匿名化を依頼する。
必ず次の見出しで出力：【考え方】【確認事項】【選択肢と注意点】【根拠の状態】。`;
function json(body,status,origin){return new Response(JSON.stringify(body),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store","Access-Control-Allow-Origin":origin,"Vary":"Origin","X-Content-Type-Options":"nosniff"}})}
export default {async fetch(request,env){
 const origin=request.headers.get("Origin")||"";
 if(!env.ALLOWED_ORIGIN||origin!==env.ALLOWED_ORIGIN)return json({error:"許可されていないアクセスです"},403,"null");
 if(request.method==="OPTIONS")return new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":origin,"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type, X-Access-Token","Access-Control-Max-Age":"600","Vary":"Origin"}});
 if(request.method!=="POST"||new URL(request.url).pathname!=="/api/ask")return json({error:"Not found"},404,origin);
 if(!env.OPENAI_API_KEY||!env.PERSONAL_ACCESS_TOKEN||!env.AI_MODEL)return json({error:"AIバックエンドが設定されていません"},503,origin);
 const token=request.headers.get("X-Access-Token")||"";
 // Compare SHA-256 digests (fixed-length) without exposing expected token.
 const digest=async s=>new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(s)));
 const [actual,expected]=await Promise.all([digest(token),digest(env.PERSONAL_ACCESS_TOKEN)]);
 let diff=0;for(let i=0;i<expected.length;i++)diff|=actual[i]^expected[i];
 if(!token||diff!==0)return json({error:"アクセスキーが正しくありません"},401,origin);
 if(Number(request.headers.get("content-length")||0)>15000)return json({error:"入力が長すぎます"},413,origin);
 let payload;try{payload=await request.json()}catch{return json({error:"JSON形式で入力してください"},400,origin)}
 const {question,category}=payload||{};
 if(typeof question!=="string"||question.trim().length<3||question.length>3000||!CATEGORIES.has(category))return json({error:"入力内容を確認してください"},400,origin);
 if(/(?:患者(?:番号|ID|氏名)|カルテ番号|生年月日)\s*[:：]/i.test(question))return json({error:"個人情報は入力しないでください"},400,origin);
 try{
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),20000);
 let upstream;try{upstream=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Authorization":"Bearer "+env.OPENAI_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({model:env.AI_MODEL,store:false,temperature:0.2,max_tokens:1300,messages:[{role:"system",content:SYSTEM},{role:"user",content:"専門分野: "+category+"\n質問: "+question}]}),signal:controller.signal})}finally{clearTimeout(timer)}
 if(!upstream.ok)return json({error:"AIサービスの応答に問題がありました"},502,origin);
 const data=await upstream.json();const answer=data?.choices?.[0]?.message?.content;
 if(typeof answer!=="string"||!answer.trim())return json({error:"回答が空でした"},502,origin);
 return json({answer},200,origin);
 }catch{return json({error:"AIサービスに接続できませんでした"},502,origin)}
}};