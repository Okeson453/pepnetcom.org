"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { useOrderTrackingTimeline } from "@/features/orders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function OrderTrackingPage() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const { register, handleSubmit } = useForm();
  const { data: timeline } = useOrderTrackingTimeline(orderId!);
  return (
    <div className="space-y-6"><h1 className="font-display text-2xl font-bold">Order Tracking</h1>
      <form onSubmit={handleSubmit((d) => setOrderId(d.orderId))} className="max-w-md flex gap-3">
        <FormField label="" className="flex-1"><Input {...register("orderId")} placeholder="Enter Order ID" /></FormField>
        <Button type="submit">Track</Button>
      </form>
      {timeline && (
        <Card><CardHeader><CardTitle>Timeline</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {(timeline as any[]).map((t: any, i: number) => (
              <p key={i}>{new Date(t.date).toLocaleString()} — {t.status}</p>
            ))}
          </CardContent></Card>)}</div>);
}
