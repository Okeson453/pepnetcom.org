import { ServiceBadge } from "@/components/brand/service-badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
export default function TradeStrategiesPage() {
  return (
    <section className="py-20 px-7 max-w-[1180px] mx-auto">
      <ServiceBadge service="trade" className="mb-4" />
      <h1 className="font-display text-4xl font-bold mb-4">Trade Strategies</h1>
      <p className="opacity-70 max-w-xl mb-8">Tested strategy packages with documented performance, built for serious independent traders.</p>
      <div className="flex gap-3">
        <Button asChild><Link href="/login">Purchase Strategy</Link></Button>
        <Button variant="secondary" asChild><Link href="/pricing">View Packages</Link></Button>
      </div>
    </section>);
}
