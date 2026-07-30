import { ContourBackground } from "@/components/brand/contour-background";
export default function AboutPage() {
  return (
    <section className="relative py-20 px-7 max-w-[1180px] mx-auto">
      <ContourBackground />
      <div className="relative z-10 max-w-2xl">
        <h1 className="font-display text-4xl font-bold mb-6">About PEPNETCOM</h1>
        <p className="opacity-70 mb-4">PEPNETCOM sits at the intersection of rigor and signal — academic precision meets market momentum.</p>
        <p className="opacity-70 mb-4">Founded to unify six critical services under one trusted network, we serve students, traders, and businesses alike.</p>
        <h2 className="font-display text-2xl font-bold mt-10 mb-4">Mission</h2>
        <p className="opacity-70">To deliver verified, structured, and timely services through a single signal network.</p>
        <h2 className="font-display text-2xl font-bold mt-10 mb-4">Vision</h2>
        <p className="opacity-70">To become the most trusted multi-service platform for African students and traders.</p>
      </div>
    </section>);
}
