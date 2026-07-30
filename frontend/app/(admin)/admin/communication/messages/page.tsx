"use client";
import { DataTable } from "@/components/data-display/data-table";
import { useMessages } from "@/features/communication";
export default function MessagesPage() {
  const { data, isLoading } = useMessages();
  return (
    <div><h1 className="font-display text-2xl font-bold mb-6">Messages</h1>
      <DataTable data={data ?? []} isLoading={isLoading} keyExtractor={(m: any) => m.id} emptyTitle="No messages"
        columns={[
          { key: "from", header: "From", cell: (m: any) => m.senderName },
          { key: "to", header: "To", cell: (m: any) => m.recipientName },
          { key: "content", header: "Content", cell: (m: any) => <span className="max-w-xs truncate block">{m.content}</span> },
          { key: "date", header: "Date", cell: (m: any) => new Date(m.createdAt).toLocaleDateString() },
        ]} /></div>);
}
