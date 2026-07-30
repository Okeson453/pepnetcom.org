"use client";

import Link from "next/link";
import { DataTable } from "@/components/data-display/data-table";

interface UsersTableProps {
  data: unknown[];
}

/** See features/orders/components/recent-orders-table.tsx for why this client wrapper exists. */
export function UsersTable({ data }: UsersTableProps) {
  return (
    <DataTable
      data={data as any[]}
      isLoading={false}
      keyExtractor={(u: any) => u.id}
      emptyTitle="No users found"
      caption="Users"
      columns={[
        {
          key: "name",
          header: "Name",
          cell: (u: any) => (
            <Link href={`/admin/users/${u.id}`} className="text-amber hover:underline">
              {u.firstName} {u.lastName}
            </Link>
          ),
        },
        { key: "email", header: "Email", cell: (u: any) => u.email },
        { key: "role", header: "Role", cell: (u: any) => <span className="font-mono text-xs">{u.role}</span> },
        { key: "status", header: "Status", cell: (u: any) => u.status },
        { key: "created", header: "Joined", cell: (u: any) => new Date(u.createdAt).toLocaleDateString() },
      ]}
    />
  );
}
