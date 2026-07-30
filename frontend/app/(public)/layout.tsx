import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bone text-graphite flex flex-col">
      <PublicHeader /><main className="flex-1">{children}</main><PublicFooter />
    </div>);
}
