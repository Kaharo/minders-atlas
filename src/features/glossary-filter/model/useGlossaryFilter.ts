import { useQueryParam } from '@/shared/lib/useQueryParam';

/** Фильтры глоссария в строке запроса: ?block=&topic=&year=&q= */
export function useGlossaryFilter() {
  const [block, setBlock] = useQueryParam('block');
  const [topic, setTopic] = useQueryParam('topic');
  const [year, setYear] = useQueryParam('year');
  const [q, setQ] = useQueryParam('q');
  return {
    block, topic, year, q,
    setBlock: (b: string | null) => { setBlock(b); setTopic(null); },
    setTopic, setYear, setQ,
    reset: () => { setBlock(null); setTopic(null); setYear(null); setQ(null); },
    active: !!(block || topic || year || q)
  };
}
