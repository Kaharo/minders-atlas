import { useLocale } from '@/shared/i18n';
import { bus, EVENTS } from '@/shared/lib/bus';
import { Button } from '@/shared/ui';
import { useSession } from '@/entities/user';
import { useFavorites } from '../model/FavoritesProvider';

/** Звезда «в избранное». Без сессии просит войти через шапку. */
export function FavoriteButton({ uid }: { uid: string }) {
  const { t } = useLocale();
  const { user, status } = useSession();
  const { has, toggle } = useFavorites();
  if (status !== 'ready') return null;
  const on = !!user && has(uid);
  return (
    <Button variant="ghost" aria-pressed={on} onClick={() => (user ? toggle(uid) : bus.emit(EVENTS.openAuth))} style={on ? { background: '#0b0b14', color: '#fff' } : undefined}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round"><path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" /></svg>
      {on ? t('В избранном', 'Saved') : t('В избранное', 'Save')}
    </Button>
  );
}
