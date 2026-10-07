import { NavLink } from 'react-router-dom';
import { useLocale } from '@/shared/i18n';
import { ROUTES } from '@/shared/config/routes';
import { Pill, PillGroup, PillLink } from '@/shared/ui';
import { UserMenu } from '@/features/auth';
import s from './Header.module.css';

const SECTIONS = [
  { to: ROUTES.glossary, label: ['Глоссарий', 'Glossary'], ready: true },
  { to: '/research', label: ['Исследования', 'Research'], ready: false },
  { to: '/incidents', label: ['Инциденты', 'Incidents'], ready: false },
  { to: '/benchmarks', label: ['Рейтинги', 'Rankings'], ready: false }
] as const;

export function Header() {
  const { locale, setLocale, t } = useLocale();
  const li = locale === 'en' ? 1 : 0;
  return (
    <header className={s.header}>
      <NavLink to={ROUTES.glossary} className={s.brand}>
        <span className={s.logo} />
        <span className={s.name}>minders</span>
        <span className={s.sub}>atlas</span>
      </NavLink>
      <span className={s.div} />
      <PillGroup>
        {SECTIONS.filter(x => x.ready).map(x => <PillLink key={x.to} to={x.to}>{x.label[li]}</PillLink>)}
      </PillGroup>
      <span className={s.spacer} />
      <nav className={s.nav}>
        <NavLink to={ROUTES.pulse} className={({ isActive }) => `${s.navLink} ${isActive ? s.navOn : ''}`}><span className={s.live} />{t('Пульс', 'Pulse')}</NavLink>
      </nav>
      <UserMenu />
      <PillGroup>
        <Pill on={locale === 'ru'} onClick={() => setLocale('ru')}>RU</Pill>
        <Pill on={locale === 'en'} onClick={() => setLocale('en')}>EN</Pill>
      </PillGroup>
    </header>
  );
}
