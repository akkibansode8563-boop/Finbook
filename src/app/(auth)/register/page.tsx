'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput } from '@/features/auth/schema';
import { signUp } from '@/features/auth/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'admin', // Default to admin for easier local/first user configuration
    },
  });

  const onSubmit = (data: any) => {
    startTransition(async () => {
      const response = await signUp(data);
      if (response?.error) {
        toast.error(response.error);
      } else {
        toast.success('Registration successful! Logging in...');
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h2 className="text-xl font-bold text-white font-display">Create Admin Account</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Set up a management login for Finbook</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            {...register('name')}
            className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-violet-600 focus:ring-violet-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-700 h-10"
            disabled={isPending}
          />
          {errors.name && (
            <p className="text-[11px] text-rose-400 font-medium">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            {...register('email')}
            className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-violet-600 focus:ring-violet-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-700 h-10"
            disabled={isPending}
          />
          {errors.email && (
            <p className="text-[11px] text-rose-400 font-medium">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:border-violet-600 focus:ring-violet-600 text-slate-900 dark:text-slate-100 placeholder:text-slate-700 h-10"
            disabled={isPending}
          />
          {errors.password && (
            <p className="text-[11px] text-rose-400 font-medium">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="role" className="text-slate-700 dark:text-slate-300 text-xs font-semibold">
            Access Role
          </Label>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Select
                disabled={isPending}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger className="bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 h-10">
                  <SelectValue placeholder="Select access role" />
                </SelectTrigger>
                <SelectContent className="bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200">
                  <SelectItem value="admin">Administrator (Full Access)</SelectItem>
                  <SelectItem value="manager">Manager (Reports & Ledger)</SelectItem>
                  <SelectItem value="staff">Staff (CRUD operations)</SelectItem>
                  <SelectItem value="viewer">Viewer (Read-only)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.role && (
            <p className="text-[11px] text-rose-400 font-medium">{errors.role.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold h-10 transition-colors shadow-lg shadow-violet-500/20"
        >
          {isPending ? 'Registering...' : 'Register'}
        </Button>
      </form>

      <div className="text-center text-xs text-slate-500 mt-4 border-t border-slate-200 dark:border-slate-800/80 pt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-violet-400 hover:text-violet-300 font-semibold underline underline-offset-4">
          Login here
        </Link>
      </div>
    </div>
  );
}
