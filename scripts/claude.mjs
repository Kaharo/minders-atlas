// Минимальный клиент Claude API. Ключ: секрет ANTHROPIC_API_KEY, модель: переменная ATLAS_MODEL.
export const KEY = process.env.ANTHROPIC_API_KEY;
export const MODEL = process.env.ATLAS_MODEL || 'claude-sonnet-4-5';

export async function askJSON(system, user, maxTokens = 2500) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] })
  });
  if (!r.ok) throw new Error(r.status + ' ' + (await r.text()).slice(0, 300));
  const j = await r.json();
  const t = (j.content || []).map(c => c.text || '').join('');
  return JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1));
}
