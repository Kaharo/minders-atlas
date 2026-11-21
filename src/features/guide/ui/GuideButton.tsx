import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useLocale } from '@/shared/i18n';
import { Button, Modal } from '@/shared/ui';
import s from './Guide.module.css';

const KEY = 'atlas.guide.seen';
const seen = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return true; } };
const remember = () => { try { localStorage.setItem(KEY, '1'); } catch { /* хранилище недоступно: просто не запоминаем */ } };

/** Короткая справка «Как читать атлас»: открывается сама при первом визите и по кнопке в шапке. */
export function GuideButton() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  useEffect(() => { if (!seen()) setOpen(true); }, []);
  const close = () => { remember(); setOpen(false); };
  const items: [string, string, string][] = [
    ['1', t('Карта в центре', 'The map in the centre'), t('Это AI-система целиком: модель и блоки вокруг неё — защита, сборка контекста, инструменты, наблюдаемость.', 'This is a whole AI system: the model and the blocks around it — guards, context assembly, tools, observability.')],
    ['2', t('Разделы и записи', 'Sections and records'), t('Глоссарий, исследования, инциденты и рейтинги лежат на одной и той же карте. Нажмите запись в списке или точку на карте, чтобы открыть карточку с источниками.', 'Glossary, research, incidents and benchmarks sit on the same map. Click a record in the list or a point on the map to open its card with sources.')],
    ['3', t('Путь запроса', 'Request path'), t('Наберите фразу в строке над картой, и атлас по шагам покажет, что с ней происходит: фильтр, контекст, токены, слои модели, проверка ответа. Это учебная схема, а не запись работы настоящей модели.', 'Type a phrase in the bar above the map and the atlas shows, step by step, what happens to it: filter, context, tokens, model layers, output check. It is a teaching diagram, not a recording of a real model.')],
    ['4', t('Поиск', 'Search'), t('Строка в шапке ищет сразу по всем разделам. Клавиша / ставит в неё курсор.', 'The bar in the header searches every section at once. Press / to jump to it.')],
    ['5', t('Модель и время', 'Model and time'), t('Справа — выбранная модель, её можно сменить. Шкала внизу показывает записи по годам.', 'On the right is the selected model, which you can change. The scale at the bottom shows records by year.')]
  ];
  return (
    <>
      <button type="button" className={s.btn} onClick={() => setOpen(true)}>{t('Как читать', 'How to read')}</button>
      {/* у шапки backdrop-filter: окно с position: fixed внутри неё обрезается, поэтому выносим в body */}
      {open && createPortal(
        <Modal open={open} onClose={close} kicker="minders atlas" title={t('Как читать атлас', 'How to read the atlas')} width={560}>
        <ol className={s.list}>
          {items.map(([n, h, x]) => <li key={n} className={s.item}><span className={s.n} aria-hidden="true">{n}</span><span><b className={s.h}>{h}</b><span className={s.x}>{x}</span></span></li>)}
        </ol>
        <div className={s.foot}><Button onClick={close}>{t('Понятно', 'Got it')}</Button></div>
        </Modal>,
        document.body
      )}
    </>
  );
}
