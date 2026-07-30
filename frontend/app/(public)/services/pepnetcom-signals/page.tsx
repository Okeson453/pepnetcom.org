import { ServiceBadge } from "@/components/brand/service-badge";
import { SignalLineChart } from "@/components/charts";
import { Button } from "@/components/ui/button";
import Link from "next/link";
const mockData = [
  { time: "Mon", value: 72 }, { time: "Tue", value: 75 }, { time: "Wed", value: 78 },
  { time: "Thu", value: 76 }, { time: "Fri", value: 80 }, { time: "Sat", value: 82 }, { time: "Sun", value: 78.4 },
];
export default function SignalsPage() {
  return (
    <section className="py-20 px-7 max-w-[1180px] mx-auto">
      <ServiceBadge service="signals" className="mb-4" />
      <h1 className="font-display text-4xl font-bold mb-4">PEPNETCOM Signals</h1>
      <p className="opacity-70 max-w-xl mb-8">Our flagship — live market signals with tracked accuracy, delivered the moment they trigger.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="border border-graphite/10 rounded-lg p-5 bg-bone">
          <div className="text-xs font-mono opacity-50 mb-1">ACCURACY (30D)</div>
          <div className="font-mono text-2xl text-teal">78.4%</div>
        </div>
        <div className="border border-graphite/10 rounded-lg p-5 bg-bone">
          <div className="text-xs font-mono opacity-50 mb-1">ACTIVE SUBSCRIBERS</div>
          <div className="font-mono text-2xl text-amber">2,481</div>
        </div>
        <div className="border border-graphite/10 rounded-lg p-5 bg-bone">
          <div className="text-xs font-mono opacity-50 mb-1">SIGNALS THIS WEEK</div>
          <div className="font-mono text-2xl text-ink">34</div>
        </div>
      </div>
      <div className="border border-graphite/10 rounded-lg p-5 bg-bone mb-8">
        <SignalLineChart data={mockData} />
      </div>
      <Button asChild><Link href="/register">Subscribe Now</Link></Button>
    </section>);
}
