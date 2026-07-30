"use client";
import { useState } from "react";
import Link from "next/link";
import { DataTable } from "@/components/data-display/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useBlogPosts, useDeleteBlogPost } from "@/features/cms";
import { useCursorPagination } from "@/hooks/use-cursor-pagination";

export default function BlogPostsPage() {
  const { cursor, hasPrev, goToNext, goToPrev } = useCursorPagination();
  const { data, isLoading } = useBlogPosts({ cursor });
  const deletePost = useDeleteBlogPost();
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Blog Posts</h1>
        <Button asChild><Link href="/admin/cms/blog-posts/new">+ New Post</Link></Button>
      </div>
      <DataTable
        data={data?.items ?? []}
        isLoading={isLoading}
        keyExtractor={(p: any) => p.id}
        emptyTitle="No blog posts"
        caption="Blog posts"
        pagination={{ hasNext: data?.hasMore ?? false, hasPrev, onNext: () => goToNext(data?.nextCursor), onPrev: goToPrev }}
        columns={[
          { key: "title", header: "Title", cell: (p: any) => <Link href={`/admin/cms/blog-posts/${p.id}`} className="text-amber hover:underline">{p.title}</Link> },
          { key: "slug", header: "Slug", cell: (p: any) => <span className="font-mono text-xs">{p.slug}</span> },
          { key: "published", header: "Published", cell: (p: any) => (p.published ? "Yes" : "No") },
          {
            key: "actions",
            header: "",
            cell: (p: any) => (
              <Button variant="danger" size="sm" onClick={() => setPendingDeleteId(p.id)}>
                Delete
              </Button>
            ),
          },
        ]}
      />

      <Dialog open={pendingDeleteId !== null} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete blog post?</DialogTitle>
            <DialogDescription>
              This can&apos;t be undone. The post will be permanently removed from the site.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancel</Button>
            </DialogClose>
            <Button
              variant="danger"
              onClick={() => {
                if (pendingDeleteId) deletePost.mutate({ id: pendingDeleteId });
                setPendingDeleteId(null);
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
