import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import worker, { CANONICAL_TERMS } from '../src/index.js';

const makeEnv = (limit = { success: true }) => ({
  GEMINI_API_KEY: 'test-key',
  AI_RATE_LIMITER: { limit: async () => limit },
});

const makeRequest = (body, { origin = 'https://naoya-lab.github.io', method = 'POST', path = '/normalize', headers = {} } = {}) => new Request(`https://worker.test${path}`, {
  method,
  headers: { Origin: origin, 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.4', ...headers },
  body: method === 'POST' ? JSON.stringify(body) : undefined,
});

test('rejects origins outside the configured GitHub Pages origin', async () => {
  const response = await worker.fetch(makeRequest({ text: '構音障害' }, { origin: 'https://example.com' }), makeEnv());
  assert.equal(response.status, 403);
});

test('returns normalized terms beyond the fixed vocabulary only for source phrases present in the input', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (url, options) => {
    assert.match(String(url), /generativelanguage\.googleapis\.com\/v1beta\/models\/gemini-3\.1-flash-lite:generateContent$/);
    assert.equal(options.headers['x-goog-api-key'], 'test-key');
    const body = JSON.parse(options.body);
    assert.equal(body.generationConfig.responseMimeType, 'application/json');
    assert.deepEqual(body.generationConfig.responseSchema.required, ['matches']);
    assert.equal(CANONICAL_TERMS.has('胃部不快感'), false);
    return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify({ matches: [
      { sourcePhrase: 'ろれつが回らない', canonicalTerm: '構音障害' },
      { sourcePhrase: 'ここにない語', canonicalTerm: '脳卒中' },
      { sourcePhrase: '頭痛', canonicalTerm: '胃部不快感' },
    ] }) }] } }] });
  };

  const response = await worker.fetch(makeRequest({ text: 'ろれつが回らないため受診。頭痛あり。' }), makeEnv());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { matches: [
    { sourcePhrase: 'ろれつが回らない', canonicalTerm: '構音障害' },
    { sourcePhrase: '頭痛', canonicalTerm: '胃部不快感' },
  ] });
});

test('explains an upstream 503 as temporary unavailability', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  let calls = 0;
  globalThis.fetch = async () => { calls++; return new Response('unavailable', { status: 503 }); };
  const response = await worker.fetch(makeRequest({ text: '頭痛' }), makeEnv());
  assert.equal(response.status, 502);
  assert.equal(calls, 3);
  assert.match((await response.json()).error, /一時的に利用できません/);
});

test('requires a Gemini key in the Worker secret', async () => {
  const env = makeEnv();
  delete env.GEMINI_API_KEY;
  const response = await worker.fetch(makeRequest({ text: '頭痛' }), env);
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /GEMINI_API_KEY/);
});

test('rejects overlong text before calling the model', async () => {
  const response = await worker.fetch(makeRequest({ text: 'あ'.repeat(4001) }), makeEnv());
  assert.equal(response.status, 400);
});

test('applies the configured per-IP rate limit', async () => {
  const response = await worker.fetch(makeRequest({ text: '構音障害' }), makeEnv({ success: false }));
  assert.equal(response.status, 429);
});


test('transcribes an image through Gemini without returning an interpretation', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (url, options) => {
    assert.match(String(url), /generativelanguage\.googleapis\.com\/v1beta\/models\/gemini-3\.1-flash-lite:generateContent$/);
    assert.equal(options.headers['x-goog-api-key'], 'test-key');
    const body = JSON.parse(options.body);
    assert.match(body.systemInstruction.parts[0].text, /文字起こし/);
    assert.deepEqual(body.contents[0].parts[1].inline_data, { mime_type: 'image/jpeg', data: 'aGVsbG8=' });
    return Response.json({ candidates: [{ content: { parts: [{ text: '依頼文\\n頭痛あり' }] } }] });
  };
  const response = await worker.fetch(makeRequest({ imageBase64: 'aGVsbG8=', mimeType: 'image/jpeg' }, { path: '/transcribe' }), makeEnv());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { text: '依頼文\\n頭痛あり' });
});

test('rejects unsupported image mime types before calling Gemini', async () => {
  const response = await worker.fetch(makeRequest({ imageBase64: 'aGVsbG8=', mimeType: 'text/plain' }, { path: '/transcribe' }), makeEnv());
  assert.equal(response.status, 400);
});

test('rejects non-object JSON on every POST endpoint without throwing', async () => {
  for (const path of ['/normalize', '/extract-terms', '/transcribe', '/transcribe-protocol']) {
    for (const body of [null, [], 'text', 123, true]) {
      const response = await worker.fetch(makeRequest(body, { path }), makeEnv());
      assert.equal(response.status, 400, `${path}: ${JSON.stringify(body)}`);
      assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://naoya-lab.github.io');
      assert.equal(typeof (await response.json()).error, 'string');
    }
  }
});

test('handles a null structured extraction result without throwing', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async () => Response.json({ candidates: [{ content: { parts: [{ text: 'null' }] } }] });
  const response = await worker.fetch(makeRequest({ text: '頭痛' }, { path: '/extract-terms' }), makeEnv());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { terms: [] });
});

test('answers preflight requests with the allowed origin', async () => {
  const response = await worker.fetch(makeRequest({}, { method: 'OPTIONS' }), makeEnv());
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://naoya-lab.github.io');
});

test('keeps the Worker allowlist synchronized with registered UI terms', () => {
  const html = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const rulesText = html.match(/const rules = \[([\s\S]*?)\n\s*\];/);
  assert.ok(rulesText, 'could not find UI rules array');
  const rules = Function(`return [${rulesText[1]}]`)();
  const uiTerms = new Set(rules.flatMap((rule) => rule.terms));
  assert.deepEqual([...CANONICAL_TERMS].sort(), [...uiTerms].sort());
});
