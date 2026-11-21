// Проверка источников перед публикацией: ссылка должна открываться, а текст страницы — подтверждать запись.
const UA = 'Mozilla/5.0 (compatible; minders-atlas-bot/1.0; +https://github.com/Kaharo/minders-atlas)';

/** Забирает страницу и возвращает её текст без разметки. dead=true — страницы нет (404/410 или адрес не отвечает). */
export async function fetchText(url, ms = 15000, max = 9000) {
  try {
    const r = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,text/plain' }, redirect: 'follow', signal: AbortSignal.timeout(ms) });
    if (!r.ok) return { status: r.status, dead: r.status === 404 || r.status === 410, text: '' };
    const html = await r.text();
    const text = html.replace(/<(script|style|noscript|svg)[\s\S]*?<\/\1>/gi, ' ').replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
    return { status: r.status, dead: false, text: text.slice(0, max) };
  } catch {
    return { status: 0, dead: true, text: '' };
  }
}

/** Убирает мёртвые ссылки и собирает прочитанный текст источников. */
export async function readSources(sources) {
  const alive = [], texts = [];
  for (const s of sources || []) {
    if (!s || !/^https:\/\//.test(s.u || '')) continue;
    const r = await fetchText(s.u);
    if (r.dead) continue;
    alive.push(s);
    if (r.text.length > 400) texts.push(`### ${s.t}\n${s.u}\n${r.text}`);
  }
  return { alive, texts };
}
