import Link from "next/link";
const posts = [
  { slug: "welcome", title: "Welcome to PEPNETCOM", date: "2026-01-15" },
  { slug: "trading-tips", title: "Top 5 Trading Tips for 2026", date: "2026-01-10" },
];
export default function BlogPage() {
  return (
    <section className="py-20 px-7 max-w-[1180px] mx-auto">
      <h1 className="font-display text-4xl font-bold mb-8">Blog</h1>
      <div className="grid gap-4">
        {posts.map((p) => (
          <Link key={p.slug} href={`/blog/${p.slug}`} className="block border border-graphite/10 rounded-lg p-5 bg-bone hover:border-amber/30 transition-colors">
            <h3 className="font-display text-lg font-semibold mb-1">{p.title}</h3>
            <p className="text-xs font-mono opacity-50">{p.date}</p>
          </Link>
        ))}
      </div>
    </section>);
}
