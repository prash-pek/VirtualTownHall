import Link from "next/link";

/** The 404 state from the Claude Design "States" board. */
export function NotFoundPanel({ title, body }: { title: string; body: string }) {
  return (
    <main className="page">
      <div className="border border-line bg-paper p-6">
        <p className="eyebrow">404</p>
        <h1 className="mt-1 font-display text-[28px] leading-tight font-semibold">{title}</h1>
        <p className="mt-2 text-muted">{body}</p>
        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/ballot" className="link">
            Back to your ballot
          </Link>
          <Link href="/" className="link">
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
