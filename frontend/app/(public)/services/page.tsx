import Link from "next/link";
import { ServiceBadge } from "@/components/brand/service-badge";
import { Button } from "@/components/ui/button";
const services = [
  { key: "siwes", title: "SIWES Report Writing", href: "/services/siwes-report-writing" },
  { key: "academic", title: "Academic Services", href: "/services/academic-services" },
  { key: "trade", title: "Trade Strategies", href: "/services/trade-strategies" },
  { key: "education", title: "Education Consultant", href: "/services/education-consultant" },
  { key: "marketing", title: "Digital Marketing", href: "/services/digital-marketing" },
  { key: "signals", title: "PEPNETCOM Signals", href: "/services/pepnetcom-signals" },
] as const;
export default function ServicesPage() {
  return (
    <section className="py-20 px-7 max-w-[1180px] mx-auto">
      <h1 className="font-display text-4xl font-bold mb-8">Our Services</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((s) => (
          <Link key={s.key} href={s.href} className="group block border border-graphite/10 rounded-lg p-6 hover:border-amber/30 transition-colors bg-bone">
            <ServiceBadge service={s.key} className="mb-3" />
            <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-amber transition-colors">{s.title}</h3>
            <p className="text-sm opacity-60">Explore {s.title.toLowerCase()} packages and pricing.</p>
          </Link>
        ))}
      </div>
      <div className="mt-10"><Button asChild><Link href="/pricing">View Pricing</Link></Button></div>
    </section>);
}
