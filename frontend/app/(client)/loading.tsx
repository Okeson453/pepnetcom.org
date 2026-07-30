/**
 * Next.js renders this automatically while a Server Component page in this
 * route group is loading (e.g. app/(admin)/admin/page.tsx's data fetch) —
 * previously nothing existed here, so navigation showed a blank page until
 * the fetch resolved. Applies to every nested route in this group.
 *
 * Uses bone-toned skeleton blocks (not the shared graphite-toned
 * TableSkeleton) because this renders directly inside the dashboard
 * shell's dark `bg-ink` <main>, not on a light background — graphite/10
 * would be nearly invisible here.
 */
export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded-md bg-bone/10" />
      <div className="rounded-lg border border-bone/10 overflow-hidden">
        <div className="flex gap-2 p-4 border-b border-bone/10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 flex-1 animate-pulse rounded bg-bone/10" />
          ))}
        </div>
        {Array.from({ length: 5 }).map((_, r) => (
          <div key={r} className="flex gap-2 p-4 border-b border-bone/5 last:border-0">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-4 flex-1 animate-pulse rounded bg-bone/5" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
