import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { Header } from '@/widgets/header';
import { PulsePage } from '@/pages/pulse';
import { GlossaryPage } from '@/pages/glossary';
import { NotFoundPage } from '@/pages/not-found';
import { ROUTES } from '@/shared/config/routes';
import styles from './layout.module.css';

function Layout() {
  return (
    <div className={styles.shell}>
      <Header />
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Navigate to={ROUTES.glossary} replace /> },
      { path: ROUTES.pulse, element: <PulsePage /> },
      { path: ROUTES.glossary, element: <GlossaryPage /> },
      { path: ROUTES.glossary + '/:key', element: <GlossaryPage /> },
      { path: '*', element: <NotFoundPage /> }
    ]
  }
]);
