'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/features/auth/schema';
import { signIn } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = (data: LoginInput) => {
    startTransition(async () => {
      const response = await signIn(data);
      if (response?.error) {
        toast.error(response.error);
      } else {
        toast.success('Successfully logged in!');
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold text-white font-display">Welcome Back</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Sign in to your Finbook admin portal</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="admin@finbook.com"
            {...register('email')}
            className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-violet-600 focus:ring-violet-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-600 h-10"
            disabled={isPending}
          />
          {errors.email && (
            <p className="text-[11px] text-rose-400 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">
              Password
            </Label>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-violet-600 focus:ring-violet-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-600 h-10"
            disabled={isPending}
          />
          {errors.password && (
            <p className="text-[11px] text-rose-400 font-medium">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold h-10 transition-colors shadow-lg shadow-violet-500/20"
        >
          {isPending ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500 mt-4 border-t border-slate-200 dark:border-slate-800/80 pt-4">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4">
          Register here
        </Link>
      </div>
    </div>
  );
}
