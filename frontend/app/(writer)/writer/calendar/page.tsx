"use client";
import { useOrders } from "@/features/orders";

export default function CalendarPage() {
  const { data: orders } = useOrders();
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Calendar</h1>
      <div className="border border-bone/10 rounded-lg p-5">
        <p className="text-sm opacity-60">Deadlines derived from assigned orders.</p>
        <div className="mt-4 space-y-2">
          {orders?.items.map((o: any) => o.deadline && (
            <div key={o.id} className="text-sm font-mono">{new Date(o.deadline).toLocaleDateString()} — {o.id}</div>
          ))}
        </div>
      </div>
    </div>);
}
