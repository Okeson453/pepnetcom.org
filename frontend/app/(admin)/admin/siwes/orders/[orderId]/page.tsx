"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useSiwesOrder } from "@/features/siwes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function SiwesOrderDetailPage() {
  const { orderId } = useParams();
  const { data: order } = useSiwesOrder(orderId as string);
  if (!order) return <div className="text-sm opacity-60">Loading...</div>;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">SIWES Order {orderId}</h1>
      <Card><CardHeader><CardTitle>Order Details</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Client: {order.user?.name}</p><p>Status: {order.status}</p><p>Requirements: {order.requirements}</p>
        </CardContent></Card>
      <div className="flex gap-3">
        <Button asChild><Link href={`/admin/siwes/orders/${orderId}/assign`}>Assign Writer</Link></Button>
        <Button variant="secondary" asChild><Link href={`/admin/siwes/orders/${orderId}/upload`}>Upload Report</Link></Button>
      </div>
    </div>);
}
