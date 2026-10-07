import { useLocale } from '@/shared/i18n';
import { BLOCKS, TOPICS, type Facets } from '@/entities/term';
import { useGlossaryFilter } from '../model/useGlossaryFilter';
import s from './filters.module.css';

/** Пять блоков карты как фильтр; под выбранным блоком раскрываются его подтемы. */
export function BlockTabs({ facets }: { facets: Facets | null }) {
  const { locale } = useLocale();
  const li = locale === 'en' ? 1 : 0;
  const f = useGlossaryFilter();
  const nBlock = (id: string) => facets?.domain.find(d => d.k === id)?.n ?? 0;
  const topics = f.block ? (facets?.topic.filter(t => t.domain === f.block) ?? []) : [];
  return (
    <>
      <div className={s.blocks}>
        {BLOCKS.map(b => (
          <button key={b.id} type="button" className={`${s.block} ${f.block === b.id ? s.blockOn : ''}`} onClick={() => f.setBlock(f.block === b.id ? null : b.id)} aria-pressed={f.block === b.id}>
            <span className={s.dot} style={{ background: b.color }} />
            {b.label[li]}
            <span className={s.n}>{nBlock(b.id) || ''}</span>
          </button>
        ))}
      </div>
      {topics.length > 0 && (
        <div className={s.topics}>
          {topics.map(t => (
            <button key={t.k} type="button" className={`${s.topic} ${f.topic === t.k ? s.topicOn : ''}`} onClick={() => f.setTopic(f.topic === t.k ? null : t.k)}>
              {TOPICS[t.k]?.[li] ?? t.k} · {t.n}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
