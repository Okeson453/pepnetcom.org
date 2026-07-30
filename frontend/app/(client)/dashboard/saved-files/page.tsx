import { EmptyState } from "@/components/data-display/empty-state";
export default function SavedFilesPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Saved Files</h1>
      <EmptyState title="No saved files" />
    </div>);
}
