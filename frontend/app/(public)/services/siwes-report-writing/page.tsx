import { ServiceBadge } from "@/components/brand/service-badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function SiwesPage() {
  return (
    <section className="py-20 px-7 max-w-[1180px] mx-auto">
      <ServiceBadge service="siwes" className="mb-4" />
      <h1 className="font-display text-4xl font-bold mb-4">SIWES Report Writing</h1>
      <p className="opacity-70 max-w-xl mb-8">Structured, plagiarism-checked industrial training reports, formatted to your institution&apos;s guidelines.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {["Week 1–4 Logbook", "Chapter 1–5 Report", "Full Compilation"].map((f) => (
          <div key={f} className="border border-graphite/10 rounded-lg p-5 bg-bone">
            <h3 className="font-semibold mb-2">{f}</h3>
            <p className="text-sm opacity-60">Professional formatting and plagiarism checks included.</p>
          </div>
        ))}
      </div>
      <Button asChild><Link href="/pricing">See Pricing</Link></Button>
    </section>);
}
