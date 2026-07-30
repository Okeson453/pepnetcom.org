"use client";

import { useParams } from "next/navigation";
import { useUser } from "@/features/users";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UserDetailsPage() {
  const { userId } = useParams();
  const { data: user } = useUser(userId as string);

  if (!user) return <div className="text-sm opacity-60">Loading...</div>;

  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">User Details</h1>
      <Card>
        <CardHeader><CardTitle>{user.name}</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Email: {user.email}</p>
          <p>Role: <span className="font-mono">{user.role}</span></p>
          <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
        </CardContent>
      </Card>
    </div>
  );
}
