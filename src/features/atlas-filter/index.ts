import { useQueryParam } from '@/shared/lib/useQueryParam';
import { DEFAULT_MODEL } from '@/entities/model';

/** Состояние карты в строке запроса: ?zone=&year=&kind=&model= */
export function useAtlasFilter() {
  const [zone, setZone] = useQueryParam('zone');
  const [year, setYear] = useQueryParam('year');
  const [kind, setKind] = useQueryParam('kind');
  const [model, setModel] = useQueryParam('model', DEFAULT_MODEL);
  return { zone, year, kind, model, setZone, setYear, setKind, setModel, reset: () => { setZone(null); setYear(null); setKind(null); } };
}
