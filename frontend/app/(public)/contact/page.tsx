import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
export default function ContactPage() {
  return (
    <section className="py-20 px-7 max-w-[580px] mx-auto">
      <h1 className="font-display text-4xl font-bold mb-6">Contact</h1>
      <form className="space-y-4">
        <div><Label>Name</Label><Input placeholder="Your name" /></div>
        <div><Label>Email</Label><Input type="email" placeholder="you@example.com" /></div>
        <div><Label>Message</Label><Textarea placeholder="How can we help?" /></div>
        <Button type="submit">Send Message</Button>
      </form>
      <div className="mt-8 text-sm opacity-60"><p>Email: hello@pepnetcom.com</p><p>WhatsApp: +234...</p></div>
    </section>);
}
