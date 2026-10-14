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

test('returns only allowlisted terms and source phrases present in the input', async (t) => {
  const originalFetch = globalThis.fetch;
  t.after(() => { globalThis.fetch = originalFetch; });
  globalThis.fetch = async (url, options) => {
    assert.match(String(url), /generativelanguage\.googleapis\.com\/v1beta\/models\/gemini-3\.1-flash-lite:generateContent$/);
    assert.equal(options.headers['x-goog-api-key'], 'test-key');
    const body = JSON.parse(options.body);
    assert.equal(body.generationConfig.responseMimeType, 'application/json');
    assert.deepEqual(body.generationConfig.responseSchema.required, ['matches']);
    return Response.json({ candidates: [{ content: { parts: [{ text: JSON.stringify({ matches: [
      { sourcePhrase: 'ろれつが回らない', canonicalTerm: '構音障害' },
      { sourcePhrase: 'ここにない語', canonicalTerm: '脳卒中' },
      { sourcePhrase: '頭痛', canonicalTerm: '未知の用語' },
    ] }) }] } }] });
  };

  const response = await worker.fetch(makeRequest({ text: 'ろれつが回らないため受診。' }), makeEnv());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { matches: [{ sourcePhrase: 'ろれつが回らない', canonicalTerm: '構音障害' }] });
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

test('answers preflight requests with the allowed origin', async () => {
  const response = await worker.fetch(makeRequest({}, { method: 'OPTIONS' }), makeEnv());
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://naoya-lab.github.io');
});

test('keeps the Worker allowlist synchronized with the UI trigger vocabulary', () => {
  const html = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');
  const rulesText = html.match(/const rules = \[([\s\S]*?)\n    \];/);
  assert.ok(rulesText, 'could not find UI rules array');
  const rules = Function(`return [${rulesText[1]}]`)();
  const uiTerms = new Set(rules.flatMap((rule) => rule.terms));
  assert.deepEqual([...CANONICAL_TERMS].sort(), [...uiTerms].sort());
});
