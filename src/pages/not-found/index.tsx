import { Link } from 'react-router-dom';
import { useLocale } from '@/shared/i18n';
import { ROUTES } from '@/shared/config/routes';
import { Card } from '@/shared/ui';

export function NotFoundPage() {
  const { t } = useLocale();
  return (
    <Card pad>
      <h1 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em' }}>{t('Такой страницы нет', 'No such page')}</h1>
      <Link to={ROUTES.atlas('glossary')}>{t('К карте атласа', 'To the atlas map')}</Link>
    </Card>
  );
}
