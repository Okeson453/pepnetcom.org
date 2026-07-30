import { EmptyState } from "@/components/data-display/empty-state";

// NOTE: the real backend's communication.liveChat only has startSession
// and sendMessage (both scoped to the calling user's own session) — there
// is no procedure that lists active/all chat sessions for an admin to
// monitor (see communication.router.ts). The previous version of this page
// imported a `useLiveChat` hook that was never actually defined anywhere,
// so it couldn't even compile. Not fabricating a list view against an
// endpoint that doesn't exist.
export default function LiveChatPage() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold mb-6">Live Chat</h1>
      <EmptyState
        title="Not available yet"
        description="The backend doesn't expose a way to list active chat sessions for admin monitoring yet — only starting/sending within a single session exists. Needs a real 'list sessions' endpoint before this view can work."
      />
    </div>
  );
}
