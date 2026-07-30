"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WriterSettingsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Settings</h1>
      <p className="text-sm opacity-60">Account preferences and notification settings.</p>
      <div className="mt-6 max-w-md space-y-4">
        <Button variant="secondary" asChild><Link href="/writer/profile">Change Password</Link></Button>
        <Button variant="secondary" asChild><Link href="/writer/profile">Two-Factor Authentication</Link></Button>
      </div>
    </div>
  );
}
