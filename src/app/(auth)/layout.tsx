import { ReactNode } from 'react';
import { Coins } from 'lucide-react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen bg-background flex flex-col justify-center items-center px-4 py-12 overflow-hidden select-none">
      {/* Background gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] rounded-full bg-brass/5 blur-[100px] pointer-events-none" />

      {/* Main card wrapper */}
      <div className="w-full max-w-md z-10 flex flex-col items-center">
        {/* Brand logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md">
            <Coins className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-foreground font-display">
            FINBOOK
          </span>
        </div>

        {/* Auth form container */}
        <div className="w-full bg-card border border-border rounded-2xl p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
