import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UsersTable } from "@/features/users/components/users-table";
import { createServerTrpcClient } from "@/lib/trpc/server";

export default async function UsersPage() {
  const trpc = await createServerTrpcClient();
  const users = await trpc.users.list.query({});

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Users</h1>
        <Button asChild><Link href="/admin/users/new">+ Add User</Link></Button>
      </div>
      <UsersTable data={users.items} />
    </div>
  );
}
