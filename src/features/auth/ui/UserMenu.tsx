import { useEffect, useState } from 'react';
import { useLocale } from '@/shared/i18n';
import { bus, EVENTS } from '@/shared/lib/bus';
import { Button } from '@/shared/ui';
import { userApi, useSession } from '@/entities/user';
import { AuthDialog } from './AuthDialog';
import s from './auth.module.css';

/** Кнопка входа или email + выход. При недоступном API ничего не показывает. Открывается и по событию auth:open. */
export function UserMenu() {
  const { t } = useLocale();
  const { user, status, setUser } = useSession();
  const [open, setOpen] = useState(false);
  useEffect(() => bus.on(EVENTS.openAuth, () => setOpen(true)), []);
  if (status !== 'ready') return null;
  if (!user) return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>{t('Войти', 'Sign in')}</Button>
      <AuthDialog open={open} onClose={() => setOpen(false)} />
    </>
  );
  return (
    <div className={s.menu}>
      <span className={s.email} title={user.email}>{user.name || user.email}</span>
      <Button variant="ghost" onClick={async () => { await userApi.logout(); setUser(null); }}>{t('Выйти', 'Sign out')}</Button>
    </div>
  );
}
