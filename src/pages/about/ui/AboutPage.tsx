import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLocale } from '@/shared/i18n';
import { useLoad } from '@/shared/lib/useLoad';
import { Card, Kicker } from '@/shared/ui';
import { api } from '@/shared/api/client';
import s from './AboutPage.module.css';

interface Health { entities?: Record<string, number>; meta?: { pulse_updated?: string } }

/** Точечный счётчик: n точек в сетке 6 px, максимум 60 */
function Dots({ n, color }: { n: number; color: string }) {
  const pts = useMemo(() => Array.from({ length: Math.min(60, Math.max(1, Math.round(n / (n > 60 ? n / 60 : 1)))) }, (_, i) => ({ x: (i % 20) * 8, y: Math.floor(i / 20) * 10, o: 0.35 + 0.65 * ((i * 7) % 10) / 10 })), [n]);
  return <div className={s.dots} aria-hidden>{pts.map((p, i) => <span key={i} style={{ left: p.x, top: p.y, background: color, opacity: p.o }} />)}</div>;
}

export function AboutPage() {
  const { t } = useLocale();
  const health = useLoad('health', () => api.get<Health>('/health'));
  useEffect(() => { document.title = t('О проекте · minders atlas', 'About · minders atlas'); }, [t]);
  const e = health.data?.entities ?? {};
  const counts = [
    { to: '/atlas/glossary', label: t('Термины', 'Terms'), n: e.term ?? 340, color: '#3b5bfd' },
    { to: '/atlas/research', label: t('Исследования', 'Research'), n: e.research ?? 0, color: '#a855f7' },
    { to: '/atlas/incidents', label: t('Инциденты', 'Incidents'), n: e.incident ?? 0, color: '#ef4444' },
    { to: '/atlas/benchmarks', label: t('Рейтинги', 'Rankings'), n: e.benchmark ?? 0, color: '#f59e0b' }
  ];
  const what = [
    { no: '01', k: t('Карта', 'Map'), v: t('Архитектура ИИ-системы от модели до наблюдаемости. Каждая запись стоит на том месте, к которому относится.', 'The architecture of an AI system, from model to observability. Every entry sits where it belongs.') },
    { no: '02', k: t('Четыре раздела', 'Four sections'), v: t('Термины, исследования, инциденты и рейтинги. У каждой записи есть ссылка на первоисточник.', 'Terms, research, incidents and rankings. Every entry links to its primary source.') },
    { no: '03', k: t('Пульс', 'Pulse'), v: t('Новости отрасли за две недели, разобранные семью персонами: технологии, власть, экономика, наука, общество, планета и синтез.', 'Two weeks of industry news, split across seven personas: technology, power, economy, science, society, planet and synthesis.') }
  ];
  const strip = (fn: (i: number) => [string, string]) => Array.from({ length: 14 }, (_, i) => fn(i));
  const how = [
    { cad: t('ежедневно', 'daily'), ink: '#15803d', strip: strip(() => ['#22c55e', '#22c55e']), k: t('Пульс', 'Pulse'), v: t('Каждый день. Скрипт собирает публикации из открытых источников и распределяет их между персонами по теме.', 'Daily. A script collects posts from open sources and assigns them to personas by topic.') },
    { cad: t('после проверки', 'after review'), ink: '#2f45c9', strip: strip(i => [2, 6, 9, 13].includes(i) ? ['#3b5bfd', '#3b5bfd'] : [1, 4, 5, 8, 11, 12].includes(i) ? ['transparent', '#3b5bfd'] : ['rgba(14,18,48,0.08)', 'transparent']), k: t('Термины, исследования, инциденты', 'Terms, research, incidents'), v: t('Кандидаты в записи готовятся автоматически. В атлас попадают после проверки первоисточника.', 'Entry candidates are drafted automatically and published after the primary source is checked.') },
    { cad: t('при новых результатах', 'on new results'), ink: '#a16207', strip: strip(i => i === 3 || i === 10 ? ['#f59e0b', '#f59e0b'] : ['rgba(14,18,48,0.08)', 'transparent']), k: t('Рейтинги', 'Rankings'), v: t('Сверяются с публичными лидербордами при выходе новых результатов.', 'Checked against public leaderboards when new results appear.') }
  ];
  return (
    <div className={s.page}>
      <div className={s.head}>
        <Kicker>{t('о проекте', 'about')}</Kicker>
        <h1 className={s.h1}>minders atlas</h1>
        <p className={s.lead}>{t('Интерактивная карта того, как устроены ИИ-системы: модель, контекст, инструменты, ограничения и наблюдаемость. Каждый термин, исследование, инцидент и рейтинг привязан к месту в архитектуре и к первоисточнику.', 'An interactive map of how AI systems work: model, context, tools, guardrails and observability. Every term, study, incident and ranking is tied to its place in the architecture and to a primary source.')}</p>
      </div>
      <div className={s.counts}>
        {counts.map(c => <Link key={c.to} to={c.to} className={s.count}><span className={s.cl}><i style={{ background: c.color }} />{c.label}</span><Dots n={c.n} color={c.color} /><span className={s.cn}>{c.n}</span></Link>)}
      </div>
      <Card pad>
        <h2 className={s.h2}>{t('Как устроен', 'How it works')}</h2>
        <div className={s.what}>{what.map(w => <div key={w.no} className={s.wi}><span className={s.wno}>{w.no}</span><span className={s.wk}>{w.k}</span><span className={s.wv}>{w.v}</span></div>)}</div>
      </Card>
      <Card pad>
        <div className={s.howHead}>
          <h2 className={s.h2}>{t('Как обновляется', 'How it updates')}</h2>
          <div className={s.lg}><span><i style={{ background: '#0b0b14' }} />{t('опубликовано', 'published')}</span><span><i style={{ border: '1.5px solid #0b0b14' }} />{t('черновик', 'draft')}</span><span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--muted-3)' }}>{t('14 точек = 14 дней', '14 dots = 14 days')}</span></div>
        </div>
        {how.map(h => (
          <div key={h.k} className={s.how}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}><span className={s.hk}>{h.k}</span><span className={s.hc} style={{ color: h.ink }}>{h.cad}</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
              <div className={s.strip}>{h.strip.map(([bg, bd], i) => <i key={i} style={{ background: bg, borderColor: bd }} />)}</div>
              <span className={s.hv}>{h.v}</span>
            </div>
          </div>
        ))}
      </Card>
      <div className={s.two}>
        <Card pad>
          <Kicker>{t('Основатель', 'Founder')}</Kicker>
          <div className={s.person}><span className={s.avatar}>ҚБ</span><div><div className={s.pname}>Қанат Базаралы</div><div className={s.prole}>{t('основатель minders atlas', 'founder of minders atlas')}</div></div></div>
          <p className={s.bio}>{t('MBA и Fulbright Scholar с бэкграундом в информационных системах. Основатель minders astana и Bolzhau Tech. Исследует, как AI может лучше понимать контекст и помогать людям делать сложные вещи понятнее.', 'MBA and Fulbright Scholar with a background in information systems. Founder of minders astana and Bolzhau Tech. Explores how AI can understand context better and help people make complex things clearer.')}</p>
          <div className={s.links}><a className={s.lnk} href="https://www.linkedin.com/in/kanat-bazaraly/" target="_blank" rel="noopener">LinkedIn ↗</a></div>
        </Card>
        <Card pad>
          <Kicker>minders astana</Kicker>
          <p className={s.bio} style={{ fontSize: 13.5 }}>{t('Атлас вырос из minders astana, сообщества в Астане, где AI становится поводом встретиться, поговорить и что-то сделать вместе. На встречах и в программе обучения он служит общей картой: по нему разбирают модели, случаи и исследования.', 'The atlas grew out of minders astana, a community in Astana where AI is a reason to meet, talk and build together. At meetups and in the learning programme it serves as a shared map for working through models, cases and research.')}</p>
          <div className={s.links}><a className={s.lnk} href="https://minders.kz" target="_blank" rel="noopener">minders.kz ↗</a><a className={s.lnk} href="https://minders.kz/learning.html" target="_blank" rel="noopener">{t('Программа обучения', 'Learning programme')} ↗</a></div>
        </Card>
      </div>
      <div className={s.contact}><span>{t('Нашли ошибку или случай, которого нет в атласе? Напишите.', 'Found an error or a case missing from the atlas? Get in touch.')}</span><a className={s.tg} href="https://t.me/+SoZBXVPxmp1mYjRi" target="_blank" rel="noopener">{t('Написать в Telegram', 'Message us on Telegram')}</a></div>
    </div>
  );
}
