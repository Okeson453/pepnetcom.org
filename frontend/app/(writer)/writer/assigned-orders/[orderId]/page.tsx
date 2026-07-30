"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useOrder } from "@/features/orders";
import { Button } from "@/components/ui/button";

export default function WriterOrderDetailsPage() {
  const { orderId } = useParams();
  const { data: order } = useOrder(orderId as string);
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Order {orderId}</h1>
      <div className="border border-bone/10 rounded-lg p-5 text-sm space-y-2">
        <p>Service: {order?.serviceType}</p>
        <p>Status: {order?.status}</p>
      </div>
      <Button asChild><Link href={`/writer/assigned-orders/${orderId}/upload`}>Upload Work</Link></Button>
    </div>);
}
