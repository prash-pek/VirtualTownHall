// "How it works" on the homepage, from the Claude Design handover (docs/design/claude-design-handover.md).
// One ordered list: a vertical stepper with a rail on phones, a 3 × 2 grid of cards from sm up.
// Step 3 is optional (dashed); steps 4 and 5 repeat for every ballot item (olive tint, loop note).

type Kind = "plain" | "optional" | "loop";

const icons = {
  address: (
    <>
      <path d="M12 21s-6-5.3-6-11a6 6 0 1 1 12 0c0 5.7-6 11-6 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </>
  ),
  ballot: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="1" />
      <rect x="8" y="7" width="3" height="3" />
      <path d="M13.5 8.5h2.5M8 14h8M8 17h5" />
    </>
  ),
  quiz: (
    <>
      <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
      <circle cx="16" cy="7" r="2" />
      <circle cx="10" cy="17" r="2" />
    </>
  ),
  discuss: (
    <>
      <path d="M3.5 4.5h11v8h-6l-3 3v-3h-2z" />
      <path d="M14.5 8.5h6v8h-2v3l-3-3h-4.5v-2" />
    </>
  ),
  choice: (
    <>
      <path d="M4 20l1-4L16 5l3 3L8 19z" />
      <path d="M14 7l3 3" />
    </>
  ),
  print: (
    <>
      <path d="M7 9V3h10v6" />
      <rect x="3" y="9" width="18" height="8" rx="1" />
      <path d="M7 14h10v7H7z" />
    </>
  ),
};

const steps: { title: string; body: string; icon: keyof typeof icons; kind: Kind; loopsBack?: boolean }[] = [
  {
    title: "Tell us where you live",
    body: "Your address suggests the races and measures on your ballot. We use it once, then throw it away.",
    icon: "address",
    kind: "plain",
  },
  {
    title: "Check your ballot",
    body: "Hold your paper ballot next to the screen. Remove anything that isn’t on it and add anything that’s missing.",
    icon: "ballot",
    kind: "plain",
  },
  {
    title: "Take the values quiz",
    body: "About 5 minutes of agree or disagree statements drawn from your own ballot. Skip it if you like.",
    icon: "quiz",
    kind: "optional",
  },
  {
    title: "Discuss each race and measure",
    body: "Ask questions and hear from every candidate, or from both YES and NO, using only our cited sources.",
    icon: "discuss",
    kind: "loop",
  },
  {
    title: "Make your own choice",
    body: "Pick a candidate, YES or NO, or mark it undecided. Nothing is chosen for you.",
    icon: "choice",
    kind: "loop",
    loopsBack: true,
  },
  {
    title: "Print your summary",
    body: "One page of your choices in ballot order, ready to fill out your mail-in ballot from.",
    icon: "print",
    kind: "plain",
  },
];

function Icon({ name, className }: { name: keyof typeof icons; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className={className}
    >
      {icons[name]}
    </svg>
  );
}

const card: Record<Kind, string> = {
  plain: "sm:border-line sm:bg-paper",
  optional: "sm:border-dashed sm:border-line-strong sm:bg-paper",
  loop: "sm:border-[#d5dcc3] sm:bg-olive-soft",
};

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div>
          <p className="eyebrow">How it works</p>
          <h2 id="how-it-works" className="mt-1 font-display text-2xl leading-tight font-semibold">
            Six steps, top to bottom of your ballot
          </h2>
        </div>
        <p className="hidden text-sm text-muted sm:block">Steps 4 and 5 repeat for every item.</p>
      </div>
      <ol className="flex flex-col sm:grid sm:grid-cols-3 sm:gap-4">
        {steps.map((step, i) => {
          const last = i === steps.length - 1;
          const rowEnd = i % 3 === 2;
          return (
            <li
              key={step.title}
              className={`relative flex gap-3.5 sm:flex-col sm:gap-2 sm:border sm:p-4 ${card[step.kind]}`}
            >
              <div className="flex w-8 shrink-0 flex-col items-center sm:w-auto sm:flex-row sm:justify-between">
                <span
                  className={`flex size-8 items-center justify-center border border-ink bg-paper text-sm font-semibold sm:size-7 ${step.kind === "optional" ? "border-dashed" : ""}`}
                >
                  {i + 1}
                </span>
                <Icon name={step.icon} className="hidden size-6 sm:block" />
                {!last && (
                  <span
                    aria-hidden
                    className={`min-h-4 flex-1 border-l border-line-strong sm:hidden ${step.kind === "optional" ? "border-dashed" : ""}`}
                  />
                )}
              </div>
              <div
                className={`flex-1 sm:p-0 ${step.kind === "loop" ? "mb-2 bg-olive-soft p-3 sm:mb-0 sm:bg-transparent" : last ? "" : "pb-5 sm:pb-0"} ${step.loopsBack ? "mb-5 sm:mb-0" : ""}`}
              >
                <h3
                  className={`flex items-start gap-2 text-[17px] leading-snug font-semibold ${step.kind === "loop" ? "" : "mt-1 sm:mt-0"}`}
                >
                  <Icon name={step.icon} className="mt-0.5 size-5 shrink-0 sm:hidden" />
                  <span>
                    {step.title}
                    {step.kind === "optional" && (
                      <span className="ml-2 inline-block border border-muted px-1.5 align-[2px] text-[11px] font-semibold tracking-wide text-muted uppercase">
                        Optional
                      </span>
                    )}
                  </span>
                </h3>
                <p
                  className={`mt-1 text-[15px] sm:text-[14.5px] ${step.kind === "loop" ? "text-ink-soft" : "text-muted"}`}
                >
                  {step.body}
                </p>
                {step.loopsBack && (
                  <p className="mt-2 flex items-center gap-1.5 text-[13px] font-semibold text-olive">
                    <svg
                      viewBox="0 0 16 16"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                      className="size-4"
                    >
                      <path d="M13 8a5 5 0 1 1-1.5-3.6" />
                      <path d="M12 1.5v3h-3" />
                    </svg>
                    Back to step 4 for the next item
                  </p>
                )}
              </div>
              {!last && !rowEnd && (
                <svg
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  aria-hidden
                  className="absolute top-[22px] -right-[15px] hidden size-3.5 text-line-strong sm:block"
                >
                  <path d="M4 2l5 5-5 5" />
                </svg>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
