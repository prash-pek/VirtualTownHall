/** The beta password box. Shown where a voter would start interacting while the beta lock is on. */
export function BetaUnlock({
  next,
  message,
  intro = "TownHall AI is open to a small group of testers right now. Look around as much as you like. To look up your ballot and ask questions, enter the password you were given. We'll remember this browser.",
}: {
  next: string;
  message?: string | null;
  intro?: string;
}) {
  return (
    <form method="post" action="/api/unlock" className="card flex flex-col gap-3">
      <input type="hidden" name="next" value={next} />
      <p className="eyebrow">Private beta</p>
      <p className="text-[15.5px] leading-relaxed text-ink-soft">{intro}</p>
      <label htmlFor="beta-password" className="font-medium">
        Beta password
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="beta-password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="input flex-1"
          aria-describedby={message ? "beta-error" : undefined}
          aria-invalid={message ? true : undefined}
        />
        <button type="submit" className="btn-primary">
          Unlock
        </button>
      </div>
      {message && (
        <p id="beta-error" role="alert" className="text-sm font-medium text-warn">
          {message}
        </p>
      )}
    </form>
  );
}
