import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { logout } from '@/features/auth/authSlice';
import { baseApi } from '@/app/api';

export function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAppSelector((s) => s.auth);
  const handleLogout = () => {
    dispatch(logout());
    dispatch(baseApi.util.resetApiState()); // Clear RTK Query cache
    navigate('/admin/login');
  };
  return { ...auth, logout: handleLogout };
}