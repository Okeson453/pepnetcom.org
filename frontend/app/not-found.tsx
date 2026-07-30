import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bone text-graphite px-6">
      <h1 className="font-display text-6xl font-bold text-ink mb-4">404</h1>
      <p className="text-lg opacity-70 mb-8">This signal node does not exist.</p>
      <Link
        href="/"
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-amber text-ink font-semibold text-sm hover:bg-amber-bright transition-colors"
      >
        Return to Network
      </Link>
    </div>
  );
}
