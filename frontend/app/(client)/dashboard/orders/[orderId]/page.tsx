"use client";
import { useParams } from "next/navigation";
import { useOrder } from "@/features/orders";
import { StatusPill } from "@/components/data-display/status-pill";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrderDetailsPage() {
  const { orderId } = useParams();
  const { data: order } = useOrder(orderId as string);
  if (!order) return <div className="text-sm opacity-60">Loading...</div>;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Order {orderId}</h1>
      <Card>
        <CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Service: {order.serviceType}</p>
          <p>Status: <StatusPill status={order.status}>{order.status}</StatusPill></p>
          <p>Created: {new Date(order.createdAt).toLocaleDateString()}</p>
        </CardContent>
      </Card>
    </div>);
}
