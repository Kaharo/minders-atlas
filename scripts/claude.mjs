// Минимальный клиент модели для ботов атласа. Работает с двумя видами ключей:
//   ANTHROPIC_API_KEY — Claude API;
//   LLM_API_KEY       — любой сервис с OpenAI-совместимым API (OpenAI, Gemini, DeepSeek, OpenRouter и др.),
//                       адрес в LLM_BASE_URL (по умолчанию https://api.openai.com/v1).
// Модель: переменная ATLAS_MODEL. Для LLM_API_KEY она обязательна.
const ANTHROPIC = process.env.ANTHROPIC_API_KEY;
const OTHER = process.env.LLM_API_KEY;
export const KEY = ANTHROPIC || OTHER;
export const MODEL = process.env.ATLAS_MODEL || (ANTHROPIC ? 'claude-sonnet-4-5' : '');
const BASE = (process.env.LLM_BASE_URL || 'https://api.openai.com/v1').replace(/\/+$/, '');

const parse = (t) => JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1));

export async function askJSON(system, user, maxTokens = 2500) {
  if (ANTHROPIC) {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': ANTHROPIC, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] })
    });
    if (!r.ok) throw new Error(r.status + ' ' + (await r.text()).slice(0, 300));
    const j = await r.json();
    return parse((j.content || []).map(c => c.text || '').join(''));
  }
  if (!MODEL) throw new Error('ATLAS_MODEL не задана: укажите название модели вашего провайдера в Settings → Variables');
  const r = await fetch(BASE + '/chat/completions', {
    method: 'POST',
    headers: { authorization: 'Bearer ' + OTHER, 'content-type': 'application/json' },
    body: JSON.stringify({ model: MODEL, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] })
  });
  if (!r.ok) throw new Error(r.status + ' ' + (await r.text()).slice(0, 300));
  const j = await r.json();
  return parse(String(j.choices?.[0]?.message?.content ?? ''));
}
