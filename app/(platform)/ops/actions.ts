"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireRole } from "@/lib/auth/session";
import { setItemRejected, setSubjectPublished } from "@/lib/review/queue";

const kind = z.enum(["measure", "candidate"]);

export async function publishAction(form: FormData) {
  const session = await requireRole("admin");
  const input = z
    .object({ kind, slug: z.string().min(1), publish: z.enum(["1", "0"]) })
    .parse(Object.fromEntries(form));
  await setSubjectPublished(input.kind, input.slug, input.publish === "1", session.userId);
  revalidatePath("/ops", "layout");
}

export async function rejectAction(form: FormData) {
  const session = await requireRole("admin");
  const input = z.object({ kind, itemId: z.uuid(), reject: z.enum(["1", "0"]) }).parse(Object.fromEntries(form));
  await setItemRejected(input.kind, input.itemId, input.reject === "1", session.userId);
  revalidatePath("/ops", "layout");
}
