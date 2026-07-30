"use client";
import { useSubscriptions, useCancelSubscription } from "@/features/payments";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SubscriptionPage() {
  // subscriptions.list is cursor-paginated ({ items, nextCursor, hasMore })
  // like every other list procedure — the previous version both had the
  // wrong hook name (useSubscription, singular — never existed) and treated
  // the result as a flat array.
  const { data } = useSubscriptions();
  const cancel = useCancelSubscription();
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Subscription</h1>
      <Card>
        <CardHeader><CardTitle>Active Plan</CardTitle></CardHeader>
        <CardContent>
          {data && data.length > 0 ? (
            <div className="space-y-4">
              {data.map((s: any) => (
                <div key={s.id} className="flex items-center justify-between">
                  <span className="text-sm">{s.plan}</span>
                  <Button size="sm" variant="danger" onClick={() => cancel.mutate({ id: s.id })}>Cancel</Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm opacity-60">No active subscriptions.</p>
          )}
        </CardContent>
      </Card>
    </div>);
}
