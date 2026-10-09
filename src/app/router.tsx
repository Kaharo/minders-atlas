import { createBrowserRouter, Navigate, Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/widgets/header';
import { AtlasPage } from '@/pages/atlas';
import { PulsePage } from '@/pages/pulse';
import { GlossaryPage } from '@/pages/glossary';
import { AboutPage } from '@/pages/about';
import { NotFoundPage } from '@/pages/not-found';
import { ROUTES } from '@/shared/config/routes';
import styles from './layout.module.css';

function Layout() {
  const full = useLocation().pathname.startsWith('/atlas');
  return (
    <div className={styles.shell}>
      <Header />
      <main className={full ? styles.full : styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Navigate to={ROUTES.atlas('glossary')} replace /> },
      { path: '/atlas/:section', element: <AtlasPage /> },
      { path: '/atlas/:section/:key', element: <AtlasPage /> },
      { path: ROUTES.pulse, element: <PulsePage /> },
      { path: ROUTES.about, element: <AboutPage /> },
      { path: ROUTES.glossary, element: <GlossaryPage /> },
      { path: ROUTES.glossary + '/:key', element: <GlossaryPage /> },
      { path: '*', element: <NotFoundPage /> }
    ]
  }
]);
