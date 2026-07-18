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
        <h2 className="text-xl font-bold text-foreground font-display">Create Admin Account</h2>
        <p className="text-xs text-muted-foreground">Set up a management login for Finbook</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-muted-foreground text-xs font-semibold">
            Full Name
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            {...register('name')}
            className="bg-background border-input focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground/50 h-10"
            disabled={isPending}
          />
          {errors.name && (
            <p className="text-[11px] text-destructive font-medium">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-muted-foreground text-xs font-semibold">
            Email Address
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="john@example.com"
            {...register('email')}
            className="bg-background border-input focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground/50 h-10"
            disabled={isPending}
          />
          {errors.email && (
            <p className="text-[11px] text-destructive font-medium">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-muted-foreground text-xs font-semibold">
            Password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            {...register('password')}
            className="bg-background border-input focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground/50 h-10"
            disabled={isPending}
          />
          {errors.password && (
            <p className="text-[11px] text-destructive font-medium">{errors.password.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="role" className="text-muted-foreground text-xs font-semibold">
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
                <SelectTrigger className="bg-background border-input text-foreground h-10">
                  <SelectValue placeholder="Select access role" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  <SelectItem value="admin">Administrator (Full Access)</SelectItem>
                  <SelectItem value="manager">Manager (Reports & Ledger)</SelectItem>
                  <SelectItem value="staff">Staff (CRUD operations)</SelectItem>
                  <SelectItem value="viewer">Viewer (Read-only)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.role && (
            <p className="text-[11px] text-destructive font-medium">{errors.role.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-10 transition-colors shadow-sm"
        >
          {isPending ? 'Registering...' : 'Register'}
        </Button>
      </form>

      <div className="text-center text-xs text-muted-foreground mt-4 border-t border-border pt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:text-primary/80 font-semibold underline underline-offset-4">
          Login here
        </Link>
      </div>
    </div>
  );
}
