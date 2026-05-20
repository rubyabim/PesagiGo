'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAuthStore } from '@/lib/core/auth-store';
import { ApiService } from '@/lib/services/api-service';

type Mode = 'login' | 'register' | 'reset';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  fullName: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

const resetSchema = z
  .object({
    email: z.string().email(),
    newPassword: z.string().min(6),
    confirmPassword: z.string().min(6),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: 'Konfirmasi password tidak sama',
    path: ['confirmPassword'],
  });

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [mode, setMode] = useState<Mode>(() => {
    const mode = searchParams.get('mode');
    if (mode === 'register') {
      return 'register';
    }
    if (mode === 'reset') {
      return 'reset';
    }
    return 'login';
  });
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '' },
  });

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '', newPassword: '', confirmPassword: '' },
  });

  const loginMutation = useMutation({
    mutationFn: ApiService.login,
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user, rememberMe ? 'local' : 'session');
      toast.success('Login berhasil');
      router.push('/admin');
    },
    onError: (err) => toast.error(err.message),
  });

  const registerMutation = useMutation({
    mutationFn: ApiService.register,
    onSuccess: () => {
      toast.success('Register berhasil, silakan login');
      setMode('login');
    },
    onError: (err) => toast.error(err.message),
  });

  const resetMutation = useMutation({
    mutationFn: ApiService.resetPassword,
    onSuccess: () => {
      toast.success('Password berhasil direset, silakan login');
      const email = resetForm.getValues('email');
      loginForm.setValue('email', email);
      loginForm.setValue('password', '');
      setMode('login');
      resetForm.reset();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <main className="min-h-screen bg-linear-to-br from-blue-200 via-sky-100 to-cyan-100 px-4 py-8">
      <section className="mx-auto mt-8 w-full max-w-sm overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="bg-linear-to-r from-blue-600 to-cyan-500 px-6 py-5 text-center">
          <p className="text-xs tracking-[0.2em] text-blue-100">PESAGIGO CMS</p>
          <h1 className="mt-1 text-3xl font-bold text-white">Form Login</h1>
        </div>

        <div className="space-y-4 px-6 py-6">
          {mode === 'login' ? (
            <form className="space-y-3" onSubmit={loginForm.handleSubmit((values) => loginMutation.mutate(values))}>
              <input
                className="w-full rounded-full border border-slate-300 px-4 py-2.5 text-sm"
                placeholder="Masukan Email"
                {...loginForm.register('email')}
              />
              <div className="relative">
                <input
                  className="w-full rounded-full border border-slate-300 px-4 py-2.5 pr-18 text-sm"
                  placeholder="Masukan Password"
                  type={showLoginPassword ? 'text' : 'password'}
                  {...loginForm.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-600"
                >
                  {showLoginPassword ? 'Sembunyi' : 'Lihat'}
                </button>
              </div>

              <div className="flex items-center justify-between text-sm text-slate-500">
                <label className="inline-flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-3.5 w-3.5 accent-blue-600"
                  />
                  Ingatkan saya
                </label>
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-blue-600 hover:underline"
                >
                  Lupa password?
                </button>
              </div>

              <button
                type="submit"
                className="w-full rounded-full bg-linear-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-base font-bold text-white"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Loading...' : 'Login'}
              </button>

              <p className="pt-2 text-center text-sm text-slate-500">
                Belum menjadi anggota?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Daftar Sekarang
                </button>
              </p>
            </form>
          ) : null}

          {mode === 'register' ? (
            <form className="space-y-3" onSubmit={registerForm.handleSubmit((values) => registerMutation.mutate(values))}>
              <h2 className="text-center text-xl font-semibold text-slate-800">Daftar Akun</h2>
              <input
                className="w-full rounded-full border border-slate-300 px-4 py-2.5 text-sm"
                placeholder="Nama Lengkap"
                {...registerForm.register('fullName')}
              />
              <input
                className="w-full rounded-full border border-slate-300 px-4 py-2.5 text-sm"
                placeholder="Email"
                {...registerForm.register('email')}
              />
              <div className="relative">
                <input
                  className="w-full rounded-full border border-slate-300 px-4 py-2.5 pr-18 text-sm"
                  placeholder="Password"
                  type={showRegisterPassword ? 'text' : 'password'}
                  {...registerForm.register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowRegisterPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-600"
                >
                  {showRegisterPassword ? 'Sembunyi' : 'Lihat'}
                </button>
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-linear-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-base font-bold text-white"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? 'Loading...' : 'Daftar'}
              </button>
              <p className="text-center text-sm text-slate-500">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Login
                </button>
              </p>
            </form>
          ) : null}

          {mode === 'reset' ? (
            <form
              className="space-y-3"
              onSubmit={resetForm.handleSubmit((values) =>
                resetMutation.mutate({
                  email: values.email,
                  newPassword: values.newPassword,
                }),
              )}
            >
              <h2 className="text-center text-xl font-semibold text-slate-800">Reset Password</h2>
              <input
                className="w-full rounded-full border border-slate-300 px-4 py-2.5 text-sm"
                placeholder="Email akun"
                {...resetForm.register('email')}
              />
              <div className="relative">
                <input
                  className="w-full rounded-full border border-slate-300 px-4 py-2.5 pr-18 text-sm"
                  placeholder="Password baru"
                  type={showResetPassword ? 'text' : 'password'}
                  {...resetForm.register('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-600"
                >
                  {showResetPassword ? 'Sembunyi' : 'Lihat'}
                </button>
              </div>
              <div className="relative">
                <input
                  className="w-full rounded-full border border-slate-300 px-4 py-2.5 pr-18 text-sm"
                  placeholder="Konfirmasi password baru"
                  type={showResetConfirmPassword ? 'text' : 'password'}
                  {...resetForm.register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowResetConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-600"
                >
                  {showResetConfirmPassword ? 'Sembunyi' : 'Lihat'}
                </button>
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-linear-to-r from-blue-600 to-cyan-500 px-4 py-2.5 text-base font-bold text-white"
                disabled={resetMutation.isPending}
              >
                {resetMutation.isPending ? 'Loading...' : 'Reset Password'}
              </button>
              <p className="text-center text-sm text-slate-500">
                Kembali ke{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-semibold text-blue-600 hover:underline"
                >
                  Login
                </button>
              </p>
            </form>
          ) : null}
        </div>
      </section>
    </main>
  );
}
