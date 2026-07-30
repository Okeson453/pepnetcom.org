const testimonials = [
  { name: "Adeola M.", text: "PEPNETCOM delivered my SIWES report in 48 hours. Excellent quality." },
  { name: "Chinedu K.", text: "The trading signals are accurate and timely. Highly recommended." },
];
export default function TestimonialsPage() {
  return (
    <section className="py-20 px-7 max-w-[1180px] mx-auto">
      <h1 className="font-display text-4xl font-bold mb-8">Testimonials</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map((t, i) => (
          <div key={i} className="border border-graphite/10 rounded-lg p-6 bg-bone">
            <p className="opacity-80 mb-4">&ldquo;{t.text}&rdquo;</p>
            <p className="text-sm font-semibold">— {t.name}</p>
          </div>
        ))}
      </div>
    </section>);
}
