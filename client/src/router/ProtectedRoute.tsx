import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthenticated } from '@/features/auth/authSlice';
import Spinner from '@/components/ui/Spinner';
import { useGetMeQuery } from '@/services/authApi';

/**
 * Wraps all /admin/* routes.
 * - If not authenticated → redirect to /admin/login, preserving intended destination.
 * - While verifying session on first load → show spinner.
 * - Once verified → render child routes via <Outlet />.
 */
export default function ProtectedRoute() {
  const location       = useLocation();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Re-validate session against the server on each mount.
  // If the persisted token is stale, baseApi will attempt a refresh;
  // if that fails it clears credentials and isAuthenticated becomes false.
  const { isLoading } = useGetMeQuery(undefined, {
    skip: !isAuthenticated, // don't call /auth/me if we're already logged out
  });

  if (isLoading) {
    return <Spinner fullScreen />;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/admin/login"
        state={{ from: location }}
        replace
      />
    );
  }

  return <Outlet />;
}