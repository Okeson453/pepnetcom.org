"use client";
import { useParams } from "next/navigation";
import { useAcademicOrder } from "@/features/academic-services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function AcademicOrderDetailPage() {
  const { orderId } = useParams();
  const { data: order } = useAcademicOrder(orderId as string);
  if (!order) return <div className="text-sm opacity-60">Loading...</div>;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Academic Order {orderId}</h1>
      <Card><CardHeader><CardTitle>Details</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm"><p>Subject: {order.subject}</p><p>Status: {order.status}</p></CardContent></Card>
    </div>);
}
