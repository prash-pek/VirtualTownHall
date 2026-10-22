import Link from "next/link";

import { isRace, itemHref, itemTitle, type CatalogItem } from "@/lib/ballot/types";

export function ItemRow({
  item,
  index,
  action,
  showPlace = true,
}: {
  item: CatalogItem;
  index?: number;
  action: React.ReactNode;
  /** In a group where every item has the same place, the place is left off each row. */
  showPlace?: boolean;
}) {
  return (
    <li className="relative flex items-start justify-between gap-3 border-b border-line px-4 py-3 last:border-b-0 hover:bg-cream has-[a:focus-visible]:bg-cream">
      <div className="flex gap-3">
        {index !== undefined && (
          <span className="w-6 shrink-0 pt-0.5 text-right text-sm font-semibold text-muted">{index}.</span>
        )}
        <div>
          {(showPlace || !isRace(item)) && (
            <p className="text-[12.5px] text-muted">
              {isRace(item) ? item.jurisdiction : showPlace ? `Measure · ${item.jurisdiction}` : "Measure"}
            </p>
          )}
          {/* The whole row opens the item: the link's ::after covers the row, the action button sits above it. */}
          <Link
            href={itemHref(item)}
            className="font-semibold after:absolute after:inset-0 after:content-[''] hover:text-olive focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-ink"
          >
            {itemTitle(item)}
          </Link>
          {isRace(item) && item.candidates.length > 0 && (
            <p className="note">{item.candidates.map((c) => c.name).join(", ")}</p>
          )}
        </div>
      </div>
      <div className="relative z-10 shrink-0">{action}</div>
    </li>
  );
}

export function AddButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="btn shrink-0 px-3 py-1 text-sm">
      + Add
    </button>
  );
}
