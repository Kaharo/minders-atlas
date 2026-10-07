import { RouterProvider } from 'react-router-dom';
import { FavoritesProvider } from '@/features/favorites';
import { LocaleProvider } from './providers/LocaleProvider';
import { SessionProvider } from './providers/SessionProvider';
import { router } from './router';

export function App() {
  return (
    <LocaleProvider>
      <SessionProvider>
        <FavoritesProvider>
          <RouterProvider router={router} />
        </FavoritesProvider>
      </SessionProvider>
    </LocaleProvider>
  );
}
