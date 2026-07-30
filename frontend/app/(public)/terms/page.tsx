import Link from "next/link";

export const metadata = { title: "Terms & Conditions — PEPNETCOM" };

const LAST_UPDATED = "July 26, 2026";

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: [
      `By creating an account, placing an order, subscribing to Signals, or otherwise accessing any part of the PEPNETCOM platform ("Service"), you agree to be bound by these Terms & Conditions ("Terms"). If you do not agree, do not use the Service.`,
      "These Terms apply to all users of the Service, including clients placing orders, writers and staff fulfilling them, and visitors browsing our public pages.",
    ],
  },
  {
    title: "2. Our Services",
    body: [
      "PEPNETCOM provides the following services, each subject to the specific scope, pricing, and delivery terms described at the time of order:",
    ],
    list: [
      "SIWES report writing and logbook formatting",
      "Academic services — assignments, project writing, and report summaries",
      "Trade strategy content and PEPNETCOM Signals (market analysis and trade ideas)",
      "Education consulting — university and application guidance",
      "Digital marketing services for client projects and campaigns",
    ],
    footer: "Availability, pricing, and turnaround times for any service may change without prior notice; the terms in force at the time you place an order govern that order.",
  },
  {
    title: "3. Accounts & Eligibility",
    body: [
      "You must provide accurate, current information when registering and keep your account credentials confidential. You are responsible for all activity under your account.",
      "You must be at least 18 years old, or the age of majority in your jurisdiction, to create an account. If you are using the Service on behalf of an institution or organization, you represent that you have authority to bind that entity to these Terms.",
    ],
  },
  {
    title: "4. Orders, Pricing & Payment",
    body: [
      "Prices are listed in Nigerian Naira (₦) unless otherwise stated and are subject to change. Payment is processed through our third-party payment partners (currently Paystack, Flutterwave, and Stripe); PEPNETCOM does not store your full card details.",
      "An order is confirmed only once payment has been verified. Orders may move through stages such as pending payment, assigned, in progress, under review, delivered, and completed — you can track status from your dashboard.",
    ],
  },
  {
    title: "5. Refunds & Cancellations",
    body: [
      "Refund eligibility depends on the service and how much work has already been completed at the time of your request. Requests are reviewed on a case-by-case basis through your dashboard's refund request flow.",
      "Digital signals and time-sensitive market content, once delivered, are generally non-refundable given their perishable nature — please review this before subscribing.",
    ],
  },
  {
    title: "6. Signals & Trading Content — Important Disclaimer",
    body: [
      "PEPNETCOM Signals and any trade strategy content are provided for informational and educational purposes only and do not constitute financial, investment, or trading advice.",
      "Trading carries substantial risk of loss. Past performance of any signal, strategy, or track record is not indicative of future results. You are solely responsible for your own trading decisions, and PEPNETCOM is not liable for any losses arising from reliance on this content.",
    ],
  },
  {
    title: "7. Academic Integrity",
    body: [
      "Academic and SIWES writing services are intended as reference material, research support, and formatting assistance. You are responsible for how you use any delivered work in relation to your institution's academic integrity policies. PEPNETCOM does not guarantee acceptance of any submitted work by a school, department, or supervisor.",
    ],
  },
  {
    title: "8. Acceptable Use",
    body: [
      "You agree not to use the Service to violate any law, infringe on others' rights, upload malicious content, attempt to gain unauthorized access to our systems, or misrepresent your identity.",
    ],
  },
  {
    title: "9. Intellectual Property",
    body: [
      "The PEPNETCOM name, logo, and platform design are our property. Completed work delivered to you for a paid order becomes yours to use as described in that service's terms, but underlying templates, tools, and platform content remain ours.",
    ],
  },
  {
    title: "10. Limitation of Liability",
    body: [
      "To the maximum extent permitted by law, PEPNETCOM and its staff are not liable for indirect, incidental, or consequential damages arising from your use of the Service, including trading losses, academic outcomes, or business results from marketing services.",
    ],
  },
  {
    title: "11. Termination",
    body: [
      "We may suspend or terminate accounts that violate these Terms, engage in fraud, or abuse the Service. You may close your account at any time by contacting support.",
    ],
  },
  {
    title: "12. Changes to These Terms",
    body: [
      "We may update these Terms from time to time. Continued use of the Service after changes take effect constitutes acceptance of the revised Terms. Material changes will be reflected by an updated date at the top of this page.",
    ],
  },
  {
    title: "13. Contact",
    body: ["Questions about these Terms can be directed to our support team via the Contact page."],
  },
];

export default function TermsPage() {
  return (
    <section className="py-16 md:py-20 px-7 max-w-[780px] mx-auto">
      <h1 className="font-display text-4xl font-bold mb-2">Terms & Conditions</h1>
      <p className="text-sm opacity-50 mb-2">Last updated: {LAST_UPDATED}</p>
      <p className="text-xs opacity-40 mb-10 border-l-2 border-amber/40 pl-3">
        This is a draft policy prepared for PEPNETCOM and has not been reviewed by a lawyer. Have it reviewed by
        qualified legal counsel for your jurisdiction before relying on it in production.
      </p>
      <div className="space-y-8">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <h2 className="font-display text-lg font-semibold mb-2">{s.title}</h2>
            <div className="space-y-3 text-sm leading-relaxed opacity-80">
              {s.body.map((p, i) => <p key={i}>{p}</p>)}
              {s.list && (
                <ul className="list-disc pl-5 space-y-1">
                  {s.list.map((item) => <li key={item}>{item}</li>)}
                </ul>
              )}
              {s.footer && <p>{s.footer}</p>}
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm opacity-60 mt-10">
        See also our <Link href="/privacy-policy" className="text-amber hover:underline">Privacy Policy</Link>.
      </p>
    </section>
  );
}
