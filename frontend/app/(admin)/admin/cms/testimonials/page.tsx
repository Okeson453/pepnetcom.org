"use client";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button";
import { useTestimonials, useApproveTestimonial } from "@/features/cms";

// Field names match the real Testimonial model exactly: `content` (not
// `text`), `isApproved` (not `approved`) — see prisma/schema.prisma. The
// approve mutation also needs isApproved explicitly, so this doubles as a
// reject/un-approve action, not just a one-way approve button.
export default function TestimonialsPage() {
  const { data, isLoading } = useTestimonials();
  const mutation = useApproveTestimonial();
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Testimonials</h1>
      <DataTable data={data ?? []} isLoading={isLoading} keyExtractor={(t: any) => t.id} emptyTitle="No testimonials" caption="Testimonials"
        columns={[
          { key: "name", header: "Name", cell: (t: any) => t.name },
          { key: "content", header: "Content", cell: (t: any) => <span className="max-w-xs truncate block">{t.content}</span> },
          { key: "approved", header: "Approved", cell: (t: any) => (t.isApproved ? "Yes" : "No") },
          {
            key: "action",
            header: "",
            cell: (t: any) => (
              <Button size="sm" variant="secondary" onClick={() => mutation.mutate({ id: t.id, isApproved: !t.isApproved })}>
                {t.isApproved ? "Unapprove" : "Approve"}
              </Button>
            ),
          },
        ]} />
    </div>
  );
}
