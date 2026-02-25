import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLoginMutation } from '@/services/authApi';
import { setCredentials } from '@/features/auth/authSlice';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const schema = z.object({ email: z.string().email(), password: z.string().min(6) });

export default function AdminLoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const [login, { isLoading }] = useLoginMutation();

  useEffect(() => { if (isAuthenticated) navigate('/admin', { replace: true }); }, [isAuthenticated, navigate]);

  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (data: z.infer<typeof schema>) => {
    try {
      const result = await login(data).unwrap();
      dispatch(setCredentials(result.data));
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/admin';
      navigate(from, { replace: true });
    } catch { toast.error('Invalid email or password'); }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-ink-100 p-6">
      <div className="w-full max-w-md bg-white p-10 shadow-lg">
        <h1 className="font-display text-2xl font-bold mb-2">Admin Login</h1>
        <p className="text-ink-500 text-sm mb-8">Architecture Firm CMS</p>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
          <Input label="Email"    type="email"    error={errors.email?.message}    {...register('email')} />
          <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />
          <Button type="submit" loading={isLoading} className="w-full">Sign In</Button>
        </form>
      </div>
    </main>
  );
}