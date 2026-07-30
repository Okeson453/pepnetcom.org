"use client";
import { Button } from "@/components/ui/button";
import { useTriggerBackup, useRestoreBackup } from "@/features/settings";
export default function BackupPage() {
  const trigger = useTriggerBackup();
  const restore = useRestoreBackup();
  return (
    <div className="space-y-8">
      <h1 className="font-display text-2xl font-bold">Backup & Restore</h1>
      <div className="border border-bone/10 rounded-lg p-6 space-y-4">
        <div><h3 className="font-semibold mb-2">Create Backup</h3>
          <p className="text-sm opacity-60 mb-3">Export a full snapshot of platform data.</p>
          <Button onClick={() => trigger.mutate()} disabled={trigger.isPending}>{trigger.isPending ? "Creating..." : "Trigger Backup"}</Button>
        </div>
        <div className="border-t border-bone/10 pt-4">
          <h3 className="font-semibold mb-2">Restore</h3>
          <p className="text-sm opacity-60 mb-3">Restore from a previous backup file.</p>
          <Button variant="secondary" onClick={() => restore.mutate()} disabled={restore.isPending}>{restore.isPending ? "Restoring..." : "Restore Backup"}</Button>
        </div>
      </div>
    </div>);
}
