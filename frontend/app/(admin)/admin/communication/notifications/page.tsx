"use client";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button";
import { useNotifications, useMarkNotificationRead } from "@/features/communication";

// Field names match the real Notification model exactly: `title`/`body`
// (not `message`), `isRead` (not `read`) — see prisma/schema.prisma.
// markRead takes { ids?: string[], all?: boolean }, not { id }.
export default function AdminNotificationsPage() {
  const { data, isLoading } = useNotifications();
  const mutation = useMarkNotificationRead();
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Notifications</h1>
        <Button size="sm" variant="secondary" onClick={() => mutation.mutate({ all: true })}>Mark all read</Button>
      </div>
      <DataTable data={data ?? []} isLoading={isLoading} keyExtractor={(n: any) => n.id} emptyTitle="No notifications" caption="Notifications"
        columns={[
          { key: "title", header: "Title", cell: (n: any) => n.title },
          { key: "body", header: "Message", cell: (n: any) => n.body },
          { key: "read", header: "Read", cell: (n: any) => (n.isRead ? "Yes" : "No") },
          { key: "action", header: "", cell: (n: any) => (
            <Button size="sm" variant="secondary" disabled={n.isRead} onClick={() => mutation.mutate({ ids: [n.id] })}>
              Mark Read
            </Button>
          ) },
        ]} />
    </div>
  );
}
