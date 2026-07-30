const faqs = [
  { q: "How do I place an order?", a: "Sign up, go to your dashboard, and click 'Place New Order'." },
  { q: "What payment methods are accepted?", a: "We accept Paystack, Flutterwave, and Stripe." },
];
export default function FAQPage() {
  return (
    <section className="py-20 px-7 max-w-[780px] mx-auto">
      <h1 className="font-display text-4xl font-bold mb-8">FAQ</h1>
      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="border border-graphite/10 rounded-lg p-5 bg-bone">
            <h3 className="font-semibold mb-2">{f.q}</h3>
            <p className="text-sm opacity-70">{f.a}</p>
          </div>
        ))}
      </div>
    </section>);
}
