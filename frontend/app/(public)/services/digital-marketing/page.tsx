import { ServiceBadge } from "@/components/brand/service-badge";
export default function DigitalMarketingPage() {
  return (
    <section className="py-20 px-7 max-w-[1180px] mx-auto">
      <ServiceBadge service="marketing" className="mb-4" />
      <h1 className="font-display text-4xl font-bold mb-4">Digital Marketing</h1>
      <p className="opacity-70 max-w-xl mb-8">SEO, social media management, paid ads, and web design — managed end-to-end with monthly client reporting.</p>
    </section>);
}
