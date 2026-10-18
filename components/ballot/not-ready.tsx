/** Shown instead of the ask box while nothing on a race or measure is published yet. */
export function NotReady() {
  return (
    <section className="flex flex-col gap-2 border border-dashed border-line-strong bg-paper p-5">
      <p className="eyebrow">Discussion</p>
      <p className="text-[15px]">
        We&apos;re still checking sources for this one. You&apos;ll be able to ask questions once they&apos;re
        published.
      </p>
    </section>
  );
}
