"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { MultiStepForm } from "@/components/forms/multi-step-form";
import { FormField } from "@/components/forms/form-field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useOrderDraftStore, ORDER_SERVICE_TYPES } from "@/stores/order-draft-store";
import { useCreateOrder } from "@/features/orders";
import { useInitiatePayment } from "@/features/payments";
import { cn } from "@/lib/utils";

const SERVICE_LABELS: Record<string, string> = {
  SIWES: "SIWES Report Writing",
  ACADEMIC: "Academic Services",
  TRADE_STRATEGY: "Trade Strategies",
  EDUCATION_CONSULTANT: "Education Consulting",
  DIGITAL_MARKETING: "Digital Marketing",
  SIGNALS: "PEPNETCOM Signals",
};

export default function PlaceNewOrderPage() {
  const { data: session } = useSession();
  const { currentStep, serviceType, totalAmount, currency, notes, setStep, setServiceType, setTotalAmount, setNotes, reset } =
    useOrderDraftStore();
  const [formError, setFormError] = useState<string | null>(null);

  const createOrder = useCreateOrder();
  const initiatePayment = useInitiatePayment();

  const handleSubmit = async () => {
    setFormError(null);
    try {
      // Two real backend calls, chained: create the order (status starts as
      // DRAFT/PENDING_PAYMENT), then start a real gateway checkout for it,
      // then send the client to the gateway's hosted payment page. Nothing
      // is "complete" until the gateway redirects back and/or its webhook
      // fires — see payments.verify and the backend's webhook handlers.
      const order = await createOrder.mutateAsync({
        serviceType,
        totalAmount: Number(totalAmount),
        currency,
        notes: notes || undefined,
      });

      if (!session?.user?.email) {
        setFormError("Your account email is missing — please contact support.");
        return;
      }

      const payment = await initiatePayment.mutateAsync({
        orderId: order.id,
        currency,
        gateway: "paystack",
        email: session.user.email,
      });

      reset();
      window.location.href = payment.authorizationUrl;
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong placing your order.");
    }
  };

  const isSubmitting = createOrder.isPending || initiatePayment.isPending;

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Place New Order</h1>
      <MultiStepForm
        currentStep={currentStep}
        onStepChange={setStep}
        steps={[
          {
            label: "Service",
            content: (
              <div className="space-y-4">
                <FormField label="Select Service">
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as typeof serviceType)}
                    className={cn(
                      "flex w-full rounded-md border border-graphite/15 bg-transparent px-3 py-2 text-sm",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber"
                    )}
                  >
                    {ORDER_SERVICE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {SERVICE_LABELS[type]}
                      </option>
                    ))}
                  </select>
                </FormField>
              </div>
            ),
          },
          {
            label: "Details",
            content: (
              <div className="space-y-4">
                <FormField label="Amount">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                  />
                </FormField>
                <FormField label="Notes (optional)">
                  <Textarea
                    placeholder="Anything the writer/team should know..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </FormField>
              </div>
            ),
          },
          {
            label: "Confirm",
            content: (
              <div className="space-y-3 text-sm">
                <p className="opacity-70">
                  You&apos;ll be sent to a secure payment page to complete this order.
                </p>
                <div className="border border-graphite/10 rounded-lg p-4 space-y-1">
                  <p><span className="opacity-50">Service:</span> {SERVICE_LABELS[serviceType]}</p>
                  <p><span className="opacity-50">Amount:</span> {currency} {totalAmount || "0.00"}</p>
                  <p><span className="opacity-50">Notes:</span> {notes || "—"}</p>
                </div>
                {formError && <p className="text-rust">{formError}</p>}
              </div>
            ),
          },
        ]}
        onSubmit={handleSubmit}
        submitting={isSubmitting}
      />
    </div>
  );
}
