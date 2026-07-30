import { ServiceBadge } from "@/components/brand/service-badge";
export default function AcademicServicesPage() {
  return (
    <section className="py-20 px-7 max-w-[1180px] mx-auto">
      <ServiceBadge service="academic" className="mb-4" />
      <h1 className="font-display text-4xl font-bold mb-4">Academic Services</h1>
      <p className="opacity-70 max-w-xl mb-8">Assignment and research support across subjects, with transparent progress tracking.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {["Mathematics", "Engineering", "Computer Science", "Business Admin"].map((s) => (
          <div key={s} className="border border-graphite/10 rounded-lg p-5 bg-bone">
            <h3 className="font-semibold">{s}</h3>
          </div>
        ))}
      </div>
    </section>);
}
