import { EmptyState } from "@/components/data-display/empty-state";
export default function DownloadsPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Downloads</h1>
      <EmptyState title="No downloads" description="Your purchased files will appear here." />
    </div>);
}
