import { useState, type FormEvent } from 'react';
import { useLocale } from '@/shared/i18n';
import { Button, ErrorNote, Input, Modal } from '@/shared/ui';
import { userApi, useSession } from '@/entities/user';
import s from './auth.module.css';

export function AuthDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useLocale();
  const { setUser } = useSession();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      setUser(mode === 'login' ? await userApi.login(email, password) : await userApi.register(email, password, name || undefined));
      onClose();
    } catch (err) { setError((err as Error).message); }
    finally { setBusy(false); }
  };

  return (
    <Modal open={open} onClose={onClose} width={420} kicker="minders atlas" title={mode === 'login' ? t('Вход', 'Sign in') : t('Регистрация', 'Create account')}>
      <form className={s.form} onSubmit={submit}>
        {mode === 'register' && <Input placeholder={t('Имя (необязательно)', 'Name (optional)')} value={name} onChange={e => setName(e.target.value)} maxLength={80} />}
        <Input type="email" placeholder="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
        <Input type="password" placeholder={t('Пароль, от 8 символов', 'Password, 8+ characters')} required minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} />
        {error && <ErrorNote>{error}</ErrorNote>}
        <div className={s.row}>
          <Button type="submit" disabled={busy}>{mode === 'login' ? t('Войти', 'Sign in') : t('Создать аккаунт', 'Create account')}</Button>
          <button type="button" className={s.switch} onClick={() => setMode(m => (m === 'login' ? 'register' : 'login'))}>
            {mode === 'login' ? t('Нет аккаунта? Зарегистрироваться', 'No account? Register') : t('Уже есть аккаунт? Войти', 'Have an account? Sign in')}
          </button>
        </div>
        <span className={s.hint}>{t('Аккаунт нужен для избранного и прогресса по программе. Email никому не показывается.', 'An account keeps your favourites and course progress. Your email is never shown.')}</span>
      </form>
    </Modal>
  );
}
