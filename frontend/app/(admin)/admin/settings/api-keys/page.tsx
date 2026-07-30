"use client";
import { useState } from "react";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApiKeys, useCreateApiKey, useRevokeApiKey } from "@/features/settings";

// Matches the real backend's apiKeyCreateSchema — `name` is required (see
// settings.schema.ts). The previous version called create.mutate() with no
// arguments at all.
export default function APIKeysPage() {
  const { data, isLoading } = useApiKeys();
  const [name, setName] = useState("");
  const create = useCreateApiKey({ onSuccess: () => setName("") });
  const revoke = useRevokeApiKey();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">API Keys</h1>
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Key name" className="w-48" />
          <Button onClick={() => name && create.mutate({ name, scopes: [] })} disabled={create.isPending || !name}>
            + Generate Key
          </Button>
        </div>
      </div>
      <DataTable data={data ?? []} isLoading={isLoading} keyExtractor={(k: any) => k.id} emptyTitle="No API keys" caption="API keys"
        columns={[
          { key: "name", header: "Name", cell: (k: any) => k.name },
          { key: "key", header: "Key", cell: (k: any) => <span className="font-mono text-xs">{k.key.slice(0, 12)}...</span> },
          { key: "created", header: "Created", cell: (k: any) => new Date(k.createdAt).toLocaleDateString() },
          { key: "action", header: "", cell: (k: any) => <Button size="sm" variant="danger" onClick={() => revoke.mutate({ id: k.id })}>Revoke</Button> },
        ]} />
    </div>
  );
}
