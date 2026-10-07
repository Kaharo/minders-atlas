import { Link } from 'react-router-dom';
import { useLocale } from '@/shared/i18n';
import { ROUTES } from '@/shared/config/routes';
import { Card } from '@/shared/ui';

export function NotFoundPage() {
  const { t } = useLocale();
  return (
    <Card pad>
      <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em' }}>{t('Такой страницы нет', 'No such page')}</h1>
      <p style={{ color: 'var(--muted)', fontSize: 13.5 }}>{t('Исследования, инциденты и рейтинги переезжают на новую платформу следующими итерациями.', 'Research, incidents and rankings move to the new platform in the next iterations.')}</p>
      <Link to={ROUTES.glossary}>{t('К глоссарию', 'To the glossary')}</Link>
    </Card>
  );
}
