"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PRICING_DATA,
  ACADEMIC_SUBCATEGORIES,
  type AcademicSubcategory,
  type PricingTier,
} from "@/config/pricing-data";

type Category = "academic" | "signals" | "bundles" | "addons";

const CATEGORIES: { id: Category; label: string }[] = [
  { id: "academic", label: "Academic Services" },
  { id: "signals", label: "Signals" },
  { id: "bundles", label: "Bundles" },
  { id: "addons", label: "Add-Ons" },
];

function TierCard({ tier }: { tier: PricingTier }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-6 flex flex-col bg-bone transition-shadow",
        tier.highlight ? "border-amber ring-1 ring-amber shadow-lg" : "border-graphite/10 hover:shadow-md"
      )}
    >
      {tier.tier && (
        <span className="inline-block mb-3 self-start rounded-full bg-amber/15 px-2.5 py-1 text-[11px] font-mono font-semibold text-amber-bright">
          {tier.tier}
        </span>
      )}
      <h3 className="font-display text-lg font-semibold mb-1">{tier.name}</h3>
      <div className="mb-1">
        <span className="font-mono text-3xl font-bold text-ink">{tier.price}</span>
        {tier.period && <span className="text-sm opacity-50 ml-1">{tier.period}</span>}
      </div>
      {tier.savings && (
        <span className="inline-block mb-3 self-start rounded-full bg-teal/10 px-2.5 py-1 text-xs font-medium text-teal">
          {tier.savings}
        </span>
      )}
      <ul className="space-y-2 my-5 flex-1">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm">
            <Check className="h-4 w-4 text-amber shrink-0 mt-0.5" aria-hidden="true" />
            <span>{f}</span>
          </li>
        ))}
      </ul>
      {tier.benefits.length > 0 && (
        <ul className="space-y-1.5 mb-6 pt-4 border-t border-graphite/10">
          {tier.benefits.map((b) => (
            <li key={b} className="flex items-start gap-2 text-xs opacity-60">
              <span className="mt-1.5 h-1 w-1 rounded-full bg-amber shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      )}
      <Button asChild className="w-full mt-auto" variant={tier.highlight ? "primary" : "secondary"}>
        <Link href="/register">{tier.oneTime ? "Add to order" : "Get started"}</Link>
      </Button>
    </div>
  );
}

export default function PricingPage() {
  const [category, setCategory] = useState<Category>("academic");
  const [subcategory, setSubcategory] = useState<AcademicSubcategory>("siwes");

  const tiers: PricingTier[] =
    category === "academic" ? PRICING_DATA.academic[subcategory] : PRICING_DATA[category];

  return (
    <section className="py-16 md:py-20 px-7 max-w-[1180px] mx-auto">
      <div className="text-center mb-10">
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-3">Pricing</h1>
        <p className="opacity-60 max-w-xl mx-auto text-sm md:text-base">
          Transparent tiered pricing for every student and trader. Start small, upgrade as you grow.
        </p>
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-4" role="tablist" aria-label="Pricing category">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            role="tab"
            aria-selected={category === c.id}
            onClick={() => setCategory(c.id)}
            className={cn(
              "px-5 py-2.5 rounded-full text-sm font-medium border transition-colors",
              category === c.id
                ? "bg-ink text-bone border-ink"
                : "bg-bone text-graphite/70 border-graphite/15 hover:border-ink hover:text-ink"
            )}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Academic subcategory tabs */}
      {category === "academic" && (
        <div className="flex flex-wrap justify-center gap-2 mb-10" role="tablist" aria-label="Academic service type">
          {ACADEMIC_SUBCATEGORIES.map((s) => (
            <button
              key={s.id}
              role="tab"
              aria-selected={subcategory === s.id}
              onClick={() => setSubcategory(s.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-medium border transition-colors",
                subcategory === s.id
                  ? "bg-amber text-ink border-amber"
                  : "bg-bone text-graphite/70 border-graphite/15 hover:border-ink hover:text-ink"
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}
      {category !== "academic" && <div className="mb-6" />}

      <div
        className={cn(
          "grid gap-6 mb-16",
          tiers.length > 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : "grid-cols-1 md:grid-cols-3"
        )}
      >
        {tiers.map((tier) => (
          <TierCard key={tier.name} tier={tier} />
        ))}
      </div>

      {/* Benefits strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
        {[
          { icon: "💰", title: "Lower Entry Barrier", copy: "Start at ₦5,000. No big upfront cost for students." },
          { icon: "📈", title: "Clear Upsell Path", copy: "Upgrade anytime as your needs grow. No pressure." },
          { icon: "🎯", title: "Pay for What You Need", copy: "Only buy the tier that matches your exact requirements." },
          { icon: "🎁", title: "Bundle Savings", copy: "Combo deals save up to 55% vs buying separately." },
        ].map((b) => (
          <div key={b.title} className="bg-bone rounded-xl p-5 border border-graphite/10 text-center hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-amber/10 rounded-full flex items-center justify-center mx-auto mb-3 text-lg">
              {b.icon}
            </div>
            <h3 className="font-semibold text-sm mb-1">{b.title}</h3>
            <p className="text-xs opacity-60">{b.copy}</p>
          </div>
        ))}
      </div>

      <div className="text-center bg-ink rounded-2xl p-8 md:p-10 text-bone">
        <h2 className="font-display text-xl md:text-2xl font-bold mb-2">Need help choosing?</h2>
        <p className="opacity-60 mb-6 text-sm">Our team will recommend the best plan for your budget and goals.</p>
        <Button asChild><Link href="/contact">Talk to Us</Link></Button>
      </div>
    </section>
  );
}
