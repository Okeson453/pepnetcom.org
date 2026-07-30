import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export function PublicFooter() {
  return (
    <footer className="bg-ink text-bone border-t border-bone/10">
      <div className="max-w-[1180px] mx-auto px-7 pt-16 pb-9">
        <div className="flex flex-wrap justify-between gap-10 mb-10">
          <Logo className="text-xl text-bone" showMark markSize={28} />
          <div className="flex flex-wrap gap-16">
            <div>
              <h5 className="text-xs font-mono opacity-50 mb-3.5 uppercase tracking-wider">Services</h5>
              <ul className="flex flex-col gap-2.5">
                <li><Link href="/services/siwes-report-writing" className="text-sm opacity-75 hover:opacity-100">SIWES Report Writing</Link></li>
                <li><Link href="/services/academic-services" className="text-sm opacity-75 hover:opacity-100">Academic Services</Link></li>
                <li><Link href="/services/trade-strategies" className="text-sm opacity-75 hover:opacity-100">Trade Strategies</Link></li>
                <li><Link href="/pricing" className="text-sm opacity-75 hover:opacity-100">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-mono opacity-50 mb-3.5 uppercase tracking-wider">Company</h5>
              <ul className="flex flex-col gap-2.5">
                <li><Link href="/about" className="text-sm opacity-75 hover:opacity-100">About Us</Link></li>
                <li><Link href="/blog" className="text-sm opacity-75 hover:opacity-100">Blog</Link></li>
                <li><Link href="/contact" className="text-sm opacity-75 hover:opacity-100">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="text-xs font-mono opacity-50 mb-3.5 uppercase tracking-wider">Legal</h5>
              <ul className="flex flex-col gap-2.5">
                <li><Link href="/privacy-policy" className="text-sm opacity-75 hover:opacity-100">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-sm opacity-75 hover:opacity-100">Terms & Conditions</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap justify-between items-center pt-7 border-t border-bone/10 text-xs font-mono opacity-50 gap-3">
          <span>© {new Date().getFullYear()} PEPNETCOM. All rights reserved.</span>
          <span>ONE NETWORK / SIX SIGNALS</span>
        </div>
      </div>
    </footer>
  );
}
