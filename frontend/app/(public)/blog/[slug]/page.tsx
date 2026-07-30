interface Props { params: Promise<{ slug: string }>; }
export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  return (
    <section className="py-20 px-7 max-w-[780px] mx-auto">
      <h1 className="font-display text-3xl font-bold mb-4 capitalize">{slug.replace(/-/g, " ")}</h1>
      <p className="text-xs font-mono opacity-50 mb-6">PEPNETCOM Editorial</p>
      <article className="prose opacity-80"><p>Full article content would be rendered here from the CMS.</p></article>
    </section>);
}
