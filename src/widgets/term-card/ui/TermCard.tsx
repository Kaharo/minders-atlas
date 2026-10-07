import { useLocale } from '@/shared/i18n';
import { ymLabel } from '@/shared/lib/format';
import { useLoad } from '@/shared/lib/useLoad';
import { Button, Card, ErrorNote } from '@/shared/ui';
import { BLOCK_BY_ID, KINDS, TOPICS, termApi } from '@/entities/term';
import { FavoriteButton } from '@/features/favorites';
import s from './TermCard.module.css';

export function TermCard({ termKey, onClose }: { termKey: string | null; onClose: () => void }) {
  const { t, locale, pick } = useLocale();
  const li = locale === 'en' ? 1 : 0;
  const term = useLoad('term:' + termKey, () => termApi.get(termKey!), !!termKey);
  if (!termKey) return <Card className={s.placeholder}>{t('Выберите термин в списке слева. Карточка покажет определение, где термин появился и ссылки на первоисточники.', 'Pick a term on the left. The card shows the definition, where it appeared and links to primary sources.')}</Card>;
  if (term.error) return <Card pad><ErrorNote>{term.error}</ErrorNote></Card>;
  const x = term.data;
  if (!x) return <Card className={s.placeholder}>…</Card>;
  const block = x.domain ? BLOCK_BY_ID[x.domain] : null;
  return (
    <Card className={s.card}>
      <div className={s.top}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className={s.kind}>
            {block && <><span className={s.dot} style={{ background: block.color }} />{block.label[li]}</>}
            {x.kind && <span>· {KINDS[x.kind][li]}</span>}
            {x.topic && TOPICS[x.topic] && <span>· {TOPICS[x.topic][li]}</span>}
            {x.status === 'draft' && <span className={s.draft}>· {t('черновик', 'draft')}</span>}
          </div>
          <h1 className={s.h1}>{pick(x.title)}</h1>
          {x.aliases.length > 0 && <span className={s.alt}>{x.aliases.join(' · ')}</span>}
        </div>
        <Button variant="ghost" aria-label="close" onClick={onClose} style={{ padding: '6px 10px' }}>×</Button>
      </div>
      {pick(x.text) && <p className={s.text}>{pick(x.text)}</p>}
      {pick(x.response) && <p className={s.resp}>{pick(x.response)}</p>}
      <dl className={s.facts}>
        <dt>{t('Когда', 'When')}</dt><dd>{x.date ? ymLabel(x.date.ym) : t('без единой даты', 'no single origin date')}</dd>
        {pick(x.origin) && <><dt>{t('Где', 'Where')}</dt><dd>{pick(x.origin)}</dd></>}
      </dl>
      {x.sources.length > 0 && (
        <div className={s.sources}>
          {x.sources.map((src, i) => <a key={i} className={s.src} href={src.url} target="_blank" rel="noopener">{src.title || src.url}</a>)}
        </div>
      )}
      <div className={s.actions}><FavoriteButton uid={x.uid} /></div>
    </Card>
  );
}
