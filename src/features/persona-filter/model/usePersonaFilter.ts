import { useQueryParam } from '@/shared/lib/useQueryParam';
import { isPersonaId, type PersonaId } from '@/entities/persona';

/** Выбранная персона Пульса живёт в ?persona= */
export function usePersonaFilter(): [PersonaId | 'all', (p: PersonaId | 'all') => void] {
  const [raw, set] = useQueryParam('persona', 'all');
  const value: PersonaId | 'all' = isPersonaId(raw) ? raw : 'all';
  return [value, p => set(p === 'all' ? null : p)];
}
