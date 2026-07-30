"use client";

import { useNotifications } from "@/features/communication";
import { EmptyState } from "@/components/data-display/empty-state";

export default function WriterNotificationsPage() {
  const { data } = useNotifications();

  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Notifications</h1>
      {data && (data as any[]).length > 0 ? (
        <div className="space-y-2">
          {(data as any[]).map((n) => (
            <div key={n.id} className="border border-bone/10 rounded-lg p-4 text-sm">
              <p className="font-medium mb-1">{n.title}</p>
              <p className="opacity-70">{n.body}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState title="No notifications" />
      )}
    </div>
  );
}
