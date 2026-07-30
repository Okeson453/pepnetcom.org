"use client";
import { useParams } from "next/navigation";
import { useBlogPost } from "@/features/cms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
export default function BlogPostDetailPage() {
  const { postId } = useParams();
  const { data: post } = useBlogPost(postId as string);
  if (!post) return <div className="text-sm opacity-60">Loading...</div>;
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold">Edit Post</h1>
      <Card><CardHeader><CardTitle>{(post as any).title}</CardTitle></CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>Slug: {(post as any).slug}</p><p>Status: {(post as any).published ? "Published" : "Draft"}</p>
        </CardContent></Card>
    </div>);
}
