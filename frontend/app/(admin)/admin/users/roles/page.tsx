"use client";

import { useState } from "react";
import { DataTable } from "@/components/data-display/data-table";
import { useRoles, usePermissions } from "@/features/users";

export default function RolesPage() {
  const { data: roles, isLoading } = useRoles();
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const { data: permissions, isLoading: permissionsLoading } = usePermissions(selectedRoleId ?? "");

  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Roles & Permissions</h1>
      <DataTable
        data={roles ?? []}
        isLoading={isLoading}
        keyExtractor={(r: any) => r.id}
        emptyTitle="No roles defined"
        caption="Roles"
        columns={[
          { key: "name", header: "Role", cell: (r: any) => (
            <button className="text-amber hover:underline" onClick={() => setSelectedRoleId(r.id)}>{r.name}</button>
          ) },
        ]}
      />
      {selectedRoleId && (
        <div>
          <h2 className="font-display text-lg font-semibold mb-4">Permissions</h2>
          <DataTable
            data={permissions ?? []}
            isLoading={permissionsLoading}
            keyExtractor={(p: any) => p.id}
            emptyTitle="No permissions granted"
            caption="Role permissions"
            columns={[{ key: "name", header: "Permission", cell: (p: any) => p.name }]}
          />
        </div>
      )}
    </div>
  );
}
