import { EmptyState } from "@/components/data-display/empty-state";

// NOTE: the real backend has no earnings/payouts domain at all (see
// pepnetcom-backend/src/modules/payments — there is no `earnings` router
// namespace). The old mock router fabricated one; this page can't show
// real numbers until that endpoint exists on the backend. Not faking it.
export default function EarningsPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Earnings</h1>
      <EmptyState
        title="Not available yet"
        description="Writer earnings tracking isn't implemented on the backend yet — this page has nothing real to show until that endpoint exists."
      />
    </div>
  );
}
