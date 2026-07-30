import Link from "next/link";
import { PulseLine } from "@/components/brand/pulse-line";
import { ContourBackground } from "@/components/brand/contour-background";
import { ServiceBadge } from "@/components/brand/service-badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/data-display/stat-card";
import { StatusPill } from "@/components/data-display/status-pill";

export default function HomePage() {
  return (
    <>
      <section className="relative pt-24 pb-16 px-7 max-w-[1180px] mx-auto text-center">
        <ContourBackground />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-rust bg-rust/10 px-3 py-1.5 rounded-full mb-7">
            <span className="w-1.5 h-1.5 rounded-full bg-rust animate-pulse" />LIVE ACROSS 6 SERVICES
          </div>
          <h1 className="font-display text-[clamp(36px,6vw,68px)] font-bold leading-[1.02] mb-6 text-ink">
            One network.<br />Six <span className="text-amber">signals</span>.
          </h1>
          <p className="max-w-lg mx-auto text-[17px] opacity-70 mb-10">
            PEPNETCOM connects academic support, trading intelligence, education consulting, and marketing into a single, trusted signal.
          </p>
          <div className="max-w-[920px] mx-auto mb-10"><PulseLine variant="hero" /></div>
          <div className="flex gap-3.5 justify-center">
            <Button asChild><Link href="/register">Start with PEPNETCOM</Link></Button>
            <Button variant="secondary" asChild><Link href="/services">See how it works</Link></Button>
          </div>
        </div>
      </section>
      <section className="py-20 px-7 max-w-[1180px] mx-auto" id="services">
        <div className="max-w-xl mb-12">
          <div className="inline-flex items-center gap-2 font-mono text-xs text-teal bg-teal/10 px-3 py-1.5 rounded-full mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />SERVICES
          </div>
          <h2 className="font-display text-[clamp(28px,4vw,40px)] font-bold mb-3">Six services. One line of trust.</h2>
          <p className="opacity-70">Each service is a node on the same network.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-graphite/10 border border-graphite/10 rounded-lg overflow-hidden">
          {[
            { service: "siwes" as const, title: "SIWES Report Writing", desc: "Structured, plagiarism-checked industrial training reports." },
            { service: "academic" as const, title: "Academic Services", desc: "Assignment and research support across subjects." },
            { service: "trade" as const, title: "Trade Strategies", desc: "Tested strategy packages for serious independent traders." },
            { service: "education" as const, title: "Education Consultant", desc: "Admissions and visa guidance across partner universities." },
            { service: "marketing" as const, title: "Digital Marketing", desc: "SEO, social, ads, and web design — managed end-to-end." },
            { service: "signals" as const, title: "PEPNETCOM Signals", desc: "Live market signals with tracked accuracy." },
          ].map((s) => (
            <div key={s.service} className="bg-bone p-7 hover:bg-bone-2 transition-colors">
              <ServiceBadge service={s.service} className="mb-4" />
              <h3 className="font-display text-lg font-semibold mb-2">{s.title}</h3>
              <p className="text-sm opacity-70">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative py-20 px-7 bg-ink text-bone overflow-hidden" id="signals">
        <ContourBackground variant="ink" />
        <div className="relative z-10 max-w-[1180px] mx-auto">
          <div className="max-w-xl mb-12">
            <div className="inline-flex items-center gap-2 font-mono text-xs text-amber-bright bg-amber/10 px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-bright animate-pulse" />INSIDE THE NETWORK
            </div>
            <h2 className="font-display text-[clamp(28px,4vw,40px)] font-bold mb-3">
              The moment you log in, you&apos;re on the network.
            </h2>
            <p className="opacity-70">
              Every dashboard — Client, Admin, or Writer — shares the same signal system, so nothing ever feels like a different product.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-px bg-bone/10 border border-bone/10 rounded-lg overflow-hidden">
            <div className="bg-ink-2 p-5">
              <div className="font-display text-sm font-semibold mb-4">
                PEPNETCOM<span className="text-amber">.</span>
              </div>
              <ul className="space-y-1 text-[13px]">
                {["Dashboard", "Orders", "Signals", "Payments", "Messages", "Settings"].map((label, i) => (
                  <li
                    key={label}
                    className={i === 0 ? "px-3 py-2 rounded-md bg-amber/10 text-amber-bright" : "px-3 py-2 rounded-md text-bone/60"}
                  >
                    {label}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-ink-2 p-6">
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-display text-base font-semibold">Signal Dashboard</h4>
                <Button size="sm">+ New Signal</Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <StatCard label="Active Subscribers" value="2,481" />
                <StatCard label="Signal Accuracy (30D)" value="78.4%" trend="up" />
                <StatCard label="Avg. Response Time" value="-12s" trend="down" />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <caption className="sr-only">Recent signals</caption>
                  <thead>
                    <tr className="border-b border-bone/10 text-bone/50 text-xs uppercase tracking-wider">
                      <th scope="col" className="text-left py-2 px-3 font-medium">Signal ID</th>
                      <th scope="col" className="text-left py-2 px-3 font-medium">Pair</th>
                      <th scope="col" className="text-left py-2 px-3 font-medium">Direction</th>
                      <th scope="col" className="text-left py-2 px-3 font-medium">Result</th>
                      <th scope="col" className="text-left py-2 px-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: "SIG-2291", pair: "XAU/USD", direction: "Long", result: "+1.8%", status: "up" as const, label: "CLOSED" },
                      { id: "SIG-2292", pair: "EUR/USD", direction: "Short", result: "+0.6%", status: "up" as const, label: "CLOSED" },
                      { id: "SIG-2293", pair: "BTC/USD", direction: "Long", result: "—", status: "pending" as const, label: "ACTIVE" },
                      { id: "SIG-2294", pair: "GBP/JPY", direction: "Short", result: "-0.3%", status: "down" as const, label: "CLOSED" },
                    ].map((row) => (
                      <tr key={row.id} className="border-b border-bone/5">
                        <td className="py-2.5 px-3 font-mono text-xs">{row.id}</td>
                        <td className="py-2.5 px-3">{row.pair}</td>
                        <td className="py-2.5 px-3">{row.direction}</td>
                        <td className="py-2.5 px-3 font-mono text-xs">{row.result}</td>
                        <td className="py-2.5 px-3">
                          <StatusPill status={row.status}>{row.label}</StatusPill>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-7 max-w-[1180px] mx-auto text-center">
        <h2 className="font-display text-[clamp(28px,4vw,40px)] font-bold mb-3">Ready to get on the network?</h2>
        <p className="opacity-70 max-w-lg mx-auto mb-10">
          Whichever service brought you here, one account gets you the full PEPNETCOM signal.
        </p>
        <div className="flex gap-3.5 justify-center">
          <Button asChild><Link href="/register">Create your account</Link></Button>
          <Button variant="secondary" asChild><Link href="/contact">Talk to us</Link></Button>
        </div>
      </section>
    </>);
}
