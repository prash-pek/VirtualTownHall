/**
 * Browser storage for the voter's ballot list and their own choices. Choices never leave the
 * browser unless the voter opts in (docs/PRD §5), so they have no server copy here.
 */
import { sanitizeBallot, type BallotKey, type Choice } from "./types";

const ballotKey = "townhall:ballot";
const choicesKey = "townhall:choices";

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
