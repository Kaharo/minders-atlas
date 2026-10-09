import { NavLink } from 'react-router-dom';
import { useLocale } from '@/shared/i18n';
import { ROUTES } from '@/shared/config/routes';
import { Pill, PillGroup, PillLink } from '@/shared/ui';
import { SECTIONS, SECTION_LABEL } from '@/entities/atlas-entry';
import { UserMenu } from '@/features/auth';
import s from './Header.module.css';

export function Header() {
  const { locale, setLocale, t } = useLocale();
  const li = locale === 'en' ? 1 : 0;
  return (
    <header className={s.header}>
      <NavLink to={ROUTES.atlas('glossary')} className={s.brand}>
        <span className={s.logo} />
        <span className={s.name}>minders</span>
        <span className={s.sub}>atlas</span>
      </NavLink>
      <span className={s.div} />
      <PillGroup>
        {SECTIONS.map(x => <PillLink key={x} to={ROUTES.atlas(x)}>{SECTION_LABEL[x][li]}</PillLink>)}
      </PillGroup>
      <span className={s.spacer} />
      <nav className={s.nav}>
        <NavLink to={ROUTES.pulse} className={({ isActive }) => `${s.navLink} ${isActive ? s.navOn : ''}`}><span className={s.live} />{t('Пульс', 'Pulse')}</NavLink>
        <NavLink to={ROUTES.about} className={({ isActive }) => `${s.navLink} ${isActive ? s.navOn : ''}`}>{t('О проекте', 'About')}</NavLink>
      </nav>
      <UserMenu />
      <PillGroup>
        <Pill on={locale === 'ru'} onClick={() => setLocale('ru')}>RU</Pill>
        <Pill on={locale === 'en'} onClick={() => setLocale('en')}>EN</Pill>
      </PillGroup>
    </header>
  );
}
