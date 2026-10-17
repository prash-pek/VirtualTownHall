/**
 * Browser storage for the voter's ballot list and their own choices. Choices never leave the
 * browser unless the voter opts in (docs/PRD §5), so they have no server copy here.
 */
import { sanitizeBallot, type BallotKey, type Choice } from "./types";

const ballotKey = "townhall:ballot";
const choicesKey = "townhall:choices";
const shortlistsKey = "townhall:shortlists";

function read(key: string): unknown {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null");
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or storage disabled: everything still works for this visit.
  }
}

export const readBallot = (): BallotKey[] => sanitizeBallot(read(ballotKey) ?? []);
export const writeBallot = (items: BallotKey[]) => write(ballotKey, items);

export function readChoices(): Record<string, Choice> {
  const v = read(choicesKey);
  if (!v || typeof v !== "object") return {};
  return Object.fromEntries(
    Object.entries(v).filter(([k, c]) => typeof c === "string" && c.length <= 120 && k.length <= 120),
  );
}

export function writeChoice(key: BallotKey, choice: Choice | null) {
  const all = readChoices();
  if (choice === null) delete all[key];
  else all[key] = choice;
  write(choicesKey, all);
}

/**
 * A voter's shortlist for a race, in their order. For a ranked-choice race the order is their ranking;
 * otherwise it's the few candidates they're still weighing. Browser only, like choices.
 */
export function readShortlists(): Record<string, string[]> {
  const v = read(shortlistsKey);
  if (!v || typeof v !== "object") return {};
  return Object.fromEntries(
    Object.entries(v)
      .filter(([k, list]) => k.length <= 120 && Array.isArray(list))
      .map(([k, list]) => [
        k,
        (list as unknown[]).filter((x): x is string => typeof x === "string" && x.length <= 120).slice(0, 20),
      ]),
  );
}

export function writeShortlist(key: BallotKey, list: string[]) {
  const all = readShortlists();
  if (list.length === 0) delete all[key];
  else all[key] = list.slice(0, 20);
  write(shortlistsKey, all);
}
