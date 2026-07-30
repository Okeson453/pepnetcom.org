import Link from "next/link";

export const metadata = { title: "Privacy Policy — PEPNETCOM" };

const LAST_UPDATED = "July 26, 2026";

const SECTIONS = [
  {
    title: "1. Introduction",
    body: [
      `This Privacy Policy explains how PEPNETCOM ("we", "us") collects, uses, shares, and protects information when you use our platform, across our website, dashboards, and any connected apps.`,
    ],
  },
  {
    title: "2. Information We Collect",
    body: ["We collect the following categories of information:"],
    list: [
      "Account information — name, email address, phone number, password (stored as a salted hash, never in plain text), and role (client, writer, or admin)",
      "Order & service data — the details of any order you place, uploaded files, order status, and communication tied to that order",
      "Payment data — handled directly by our payment processors (Paystack, Flutterwave, Stripe); we receive confirmation of payment and transaction references, not your full card number",
      "Sign-in data — if you sign in with Google, we receive your name, email address, and profile photo from Google as authorized by you during that sign-in",
      "Usage data — pages visited, actions taken in your dashboard, device/browser information, and IP address, primarily for security, fraud prevention, and improving the Service",
      "Communications — messages sent through in-app messaging, support tickets, and any correspondence with our team",
    ],
  },
  {
    title: "3. How We Use Your Information",
    list: [
      "To create and maintain your account and authenticate your sign-ins",
      "To process and fulfill orders, including assigning them to writers/staff",
      "To process payments and issue invoices/refunds",
      "To send transactional communications — order updates, verification emails, password resets — via email, SMS, WhatsApp, or push notification depending on your preferences",
      "To send PEPNETCOM Signals and market updates to subscribed users",
      "To detect and prevent fraud, abuse, and security incidents",
      "To improve the Service based on aggregate usage patterns",
    ],
  },
  {
    title: "4. Third-Party Service Providers",
    body: [
      "We rely on the following categories of third-party providers to operate the Service, each of which processes a limited slice of your data strictly to perform its function:",
    ],
    list: [
      "Payment processing — Paystack, Flutterwave, Stripe",
      "Cloud storage — for uploaded files and completed deliverables (S3-compatible object storage)",
      "Email delivery — for transactional and account emails",
      "SMS delivery — for order/account notifications where enabled",
      "WhatsApp Business messaging — for order updates where enabled",
      "Push notifications — for browser/app alerts where enabled",
      "Authentication — Google, when you choose to sign in with Google instead of a password",
    ],
    footer: "We do not sell your personal information to third parties.",
  },
  {
    title: "5. Google Sign-In",
    body: [
      `If you choose "Sign in with Google," Google shares your name, email address, and profile photo with us to create or match your PEPNETCOM account. We do not receive your Google password. You can review or revoke PEPNETCOM's access to your Google account at any time from your Google Account's security settings.`,
    ],
  },
  {
    title: "6. Data Retention",
    body: [
      "We retain account and order data for as long as your account is active and as needed to comply with legal, tax, and accounting obligations. You can request deletion of your account as described in Section 9, subject to records we're required to retain by law.",
    ],
  },
  {
    title: "7. Data Security",
    body: [
      "We use industry-standard measures to protect your data, including encrypted connections (HTTPS) across the platform, hashed passwords, role-based access controls limiting who on our team can see what, and access-token-based authentication with short-lived sessions.",
      "No method of transmission or storage is 100% secure, and we cannot guarantee absolute security.",
    ],
  },
  {
    title: "8. Your Rights",
    list: [
      "Access — request a copy of the personal data we hold about you",
      "Correction — update inaccurate account information from your profile settings",
      "Deletion — request deletion of your account and associated personal data",
      "Portability — request your data in a portable format",
      "Withdraw consent — for optional communications like SMS/WhatsApp notifications or signal broadcasts, at any time",
    ],
  },
  {
    title: "9. Exercising Your Rights",
    body: [
      "You can update most account information directly from your dashboard settings. For deletion requests, data exports, or anything not available in-app, contact our support team via the Contact page.",
    ],
  },
  {
    title: "10. Cookies & Similar Technologies",
    body: [
      "We use essential cookies to keep you signed in and maintain your session. We do not use third-party advertising cookies or trackers.",
    ],
  },
  {
    title: "11. Children's Privacy",
    body: [
      "The Service is not directed to children under 18, and we do not knowingly collect personal information from them.",
    ],
  },
  {
    title: "12. International Users",
    body: [
      "PEPNETCOM primarily serves users in Nigeria, and our infrastructure and support are oriented accordingly. If you access the Service from outside Nigeria, your information may be processed in Nigeria or by processors located elsewhere as described above.",
    ],
  },
  {
    title: "13. Changes to This Policy",
    body: [
      "We may update this Privacy Policy from time to time. Material changes will be reflected by an updated date at the top of this page.",
    ],
  },
  {
    title: "14. Contact",
    body: ["Questions about this Privacy Policy or your data can be directed to our support team via the Contact page."],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <section className="py-16 md:py-20 px-7 max-w-[780px] mx-auto">
      <h1 className="font-display text-4xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-sm opacity-50 mb-2">Last updated: {LAST_UPDATED}</p>
      <p className="text-xs opacity-40 mb-10 border-l-2 border-amber/40 pl-3">
        This is a draft policy prepared for PEPNETCOM and has not been reviewed by a lawyer. Have it reviewed by
        qualified legal counsel for your jurisdiction (and, if you have EU/UK/California users, for GDPR/CCPA
        compliance specifically) before relying on it in production.
      </p>
      <div className="space-y-8">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <h2 className="font-display text-lg font-semibold mb-2">{s.title}</h2>
            <div className="space-y-3 text-sm leading-relaxed opacity-80">
              {s.body?.map((p, i) => <p key={i}>{p}</p>)}
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
        See also our <Link href="/terms" className="text-amber hover:underline">Terms & Conditions</Link>.
      </p>
    </section>
  );
}
