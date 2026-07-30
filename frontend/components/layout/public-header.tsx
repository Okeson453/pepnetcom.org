"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/services", label: "Services" },
  { href: "/services/pepnetcom-signals", label: "Signals" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-bone/85 backdrop-blur-md border-b border-graphite/10">
      <div className="max-w-[1180px] mx-auto px-7 py-4 flex items-center justify-between">
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <Logo className="text-xl text-ink" showMark markSize={30} />
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm font-medium opacity-75 hover:opacity-100 transition-opacity">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-4">
          <Button variant="secondary" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button variant="primary" size="sm" asChild>
            <Link href="/register">Get started</Link>
          </Button>
        </div>

        {/* Mobile menu toggle — the nav above is hidden below md with no
            alternative previously, leaving Services/Signals/Pricing/Contact
            unreachable from the header on small screens. */}
        <button
          className="md:hidden p-2 -mr-2 text-ink"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <nav className="md:hidden border-t border-graphite/10 bg-bone px-7 py-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="block py-2.5 text-sm font-medium opacity-75 hover:opacity-100 transition-opacity"
            >
              {item.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-3">
            <Button variant="secondary" size="sm" className="flex-1" asChild>
              <Link href="/login" onClick={() => setMobileOpen(false)}>Log in</Link>
            </Button>
            <Button variant="primary" size="sm" className="flex-1" asChild>
              <Link href="/register" onClick={() => setMobileOpen(false)}>Get started</Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
