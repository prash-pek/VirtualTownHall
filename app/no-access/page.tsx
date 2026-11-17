import type { Metadata } from "next";

import { NoAccessNote } from "@/components/access-gate";

export const metadata: Metadata = {
  title: "No access yet · TownHall AI",
  robots: { index: false, follow: false },
};

/** Where /ops and /admin land for a signed-in user without TownHall on their access list. */
export default function NoAccessPage() {
  return (
    <main className="page max-w-md">
      <NoAccessNote />
    </main>
  );
}
