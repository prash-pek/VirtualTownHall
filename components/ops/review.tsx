import { publishAction, publishRaceAction, rejectAction } from "@/app/(platform)/ops/actions";
import type { ItemKind, QueueStatus, ReviewItem, SubjectKind } from "@/lib/review/queue";

const statusLabel: Record<QueueStatus, string> = {
  draft: "Not yet reviewed",
  in_review: "In review",
  published: "Published",
  rejected: "Hidden",
  withdrawn: "Withdrawn",
};

export function StatusTag({ status }: { status: QueueStatus }) {
  return status === "published" ? (
    <span className="inline-block border border-olive px-1.5 text-[11px] font-semibold tracking-wide text-olive uppercase">
      {statusLabel[status]}
    </span>
  ) : (
    <span className="preview-tag">{statusLabel[status]}</span>
  );
}

export function PublishForm({ kind, slug, published }: { kind: SubjectKind; slug: string; published: boolean }) {
  return (
    <form action={publishAction}>
      <input type="hidden" name="kind" value={kind} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="publish" value={published ? "0" : "1"} />
      <button className={published ? "btn" : "btn-primary"}>
        {published ? "Unpublish (back to draft)" : "Publish to voters"}
      </button>
    </form>
  );
}

/** Publishes every candidate in the race with content, or unpublishes them all once they're all published. */
export function PublishRaceForm({ race, count, allPublished }: { race: string; count: number; allPublished: boolean }) {
  return (
    <form action={publishRaceAction}>
      <input type="hidden" name="race" value={race} />
      <input type="hidden" name="publish" value={allPublished ? "0" : "1"} />
      <button className={`${allPublished ? "btn" : "btn-primary"} px-3 py-1 text-sm`}>
        {allPublished ? "Unpublish race" : `Publish all ${count}`}
      </button>
    </form>
  );
}

export function ReviewItems({ kind, items }: { kind: ItemKind; items: ReviewItem[] }) {
  if (items.length === 0) return <p className="card text-muted">No sourced items.</p>;
  return (
    <ul className="card flex flex-col p-0">
      {items.map((i) => (
        <li
          key={i.id}
          className={`flex flex-col gap-1 border-b border-line px-4 py-3 last:border-b-0 ${i.status === "rejected" ? "opacity-50" : ""}`}
        >
          <div className="flex items-baseline justify-between gap-3">
            <p className="eyebrow">{i.label}</p>
            <StatusTag status={i.status} />
          </div>
          <p>{i.statement}</p>
          {i.excerpt && <blockquote className="note border-l-2 border-line pl-3 italic">“{i.excerpt}”</blockquote>}
          <p className="note break-all">
            {i.tier && `${i.tier} · `}
            {i.publisher && `${i.publisher} · `}
            {i.sourceUrl ? (
              <a href={i.sourceUrl} className="link" target="_blank" rel="noopener noreferrer">
                {i.sourceUrl}
              </a>
            ) : (
              "No source link"
            )}
          </p>
          {i.verification && <p className="note">Verifier: {i.verification}</p>}
          <form action={rejectAction} className="self-end">
            <input type="hidden" name="kind" value={kind} />
            <input type="hidden" name="itemId" value={i.id} />
            <input type="hidden" name="reject" value={i.status === "rejected" ? "0" : "1"} />
            <button className="note hover:text-ink">{i.status === "rejected" ? "Restore" : "Hide from voters"}</button>
          </form>
        </li>
      ))}
    </ul>
  );
}
