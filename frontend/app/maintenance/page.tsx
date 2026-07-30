import { LogoMark } from "@/components/brand/logo";

export const metadata = { title: "Down for maintenance — PEPNETCOM" };

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-ink text-bone flex flex-col items-center justify-center px-6 text-center">
      <LogoMark size={48} className="mb-6" />
      <h1 className="font-display text-2xl font-bold mb-2">We&apos;ll be right back</h1>
      <p className="text-sm opacity-60 max-w-sm">
        PEPNETCOM is undergoing scheduled maintenance. We expect to be back shortly — thanks for your patience.
      </p>
    </div>
  );
}
