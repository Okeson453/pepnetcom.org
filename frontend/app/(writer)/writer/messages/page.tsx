"use client";
import { useMessages } from "@/features/communication";
import { EmptyState } from "@/components/data-display/empty-state";

export default function WriterMessagesPage() {
  const { data } = useMessages();
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Messages</h1>
      {data && (data as any[]).length > 0 ? (
        <div className="space-y-2">
          {(data as any[]).map((m) => (
            <div key={m.id} className="border border-bone/10 rounded-lg p-4 text-sm">{m.content}</div>
          ))}
        </div>
      ) : (
        <EmptyState title="No messages" />
      )}
    </div>);
}
