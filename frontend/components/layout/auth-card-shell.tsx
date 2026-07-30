import { Logo } from "@/components/brand/logo";

interface AuthCardShellProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthCardShell({ children, title, subtitle }: AuthCardShellProps) {
  return (
    <div className="min-h-screen bg-bone flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <Logo className="text-2xl text-ink justify-center mb-6" showMark markSize={34} />
          <h1 className="font-display text-2xl font-bold text-ink mb-2">{title}</h1>
          {subtitle && <p className="text-sm opacity-70">{subtitle}</p>}
        </div>
        <div className="bg-bone border border-graphite/15 rounded-xl p-8 shadow-xl shadow-graphite/5">
          {children}
        </div>
      </div>
    </div>
  );
}
