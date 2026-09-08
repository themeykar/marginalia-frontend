export default function Features() {
  return (
    <section className="w-full max-w-6xl mx-auto px-6 sm:px-8 pt-16 pb-28 sm:pt-20 sm:pb-36">
      {/* Section Header / Soft Rule */}
      <div className="border-t border-foreground/10 pt-10 sm:pt-14 mb-10 sm:mb-14">
        <p className="font-serif italic text-foreground/60 text-lg sm:text-xl max-w-xl">
          Three quiet spaces designed for the way thoughtful reading actually
          happens.
        </p>
      </div>

      {/* Asymmetric 3-Part Preview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8">
        {/* 1. The Shelf — Asymmetric anchor spanning 7 columns */}
        <div className="md:col-span-7 rounded-lg border border-foreground/10 bg-card/[0.03] p-7 sm:p-9 flex flex-col justify-between hover:border-foreground/20 hover:bg-card/[0.05] transition-colors duration-200">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-foreground tracking-tight">
              The Shelf
            </h2>
            <p className="mt-3 text-foreground/75 font-sans text-base leading-relaxed font-light max-w-md">
              A quiet ledger for every volume waiting on your nightstand, open in
              your hands, or finished.
            </p>
          </div>

          {/* Visual Hint: Tasteless/abstract spine cluster honoring the cover_color fallback system */}
          <div className="mt-10 sm:mt-12 pt-6 border-b border-foreground/15 flex items-end gap-2 sm:gap-2.5 h-36 px-2">
            <div
              className="w-5 sm:w-6 h-24 bg-primary/90 rounded-t-xs border-t border-foreground/10"
              title="Want to Read"
            />
            <div
              className="w-4 sm:w-5 h-20 bg-secondary/80 rounded-t-xs border-t border-foreground/10"
              title="Reading"
            />
            <div
              className="w-7 sm:w-8 h-32 bg-status-reading rounded-t-xs border-t border-foreground/10"
              title="Read"
            />
            <div
              className="w-4 sm:w-5 h-16 bg-card/60 rounded-t-xs border-t border-foreground/10"
              title="Want to Read"
            />
            <div
              className="w-6 sm:w-7 h-28 bg-primary rounded-t-xs border-t border-foreground/10"
              title="Reading"
            />
            <div
              className="w-5 sm:w-6 h-22 bg-secondary rounded-t-xs border-t border-foreground/10"
              title="Read"
            />
            <div
              className="w-8 sm:w-9 h-30 bg-foreground/25 rounded-t-xs border-t border-foreground/10"
              title="Finished"
            />
            <div
              className="w-4 sm:w-5 h-26 bg-status-reading/80 rounded-t-xs border-t border-foreground/10"
              title="Reading"
            />
          </div>
        </div>

        {/* 2. Notes & Quotes — Spanning 5 columns */}
        <div className="md:col-span-5 rounded-lg border border-foreground/10 bg-card/[0.03] p-7 sm:p-9 flex flex-col justify-between hover:border-foreground/20 hover:bg-card/[0.05] transition-colors duration-200">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-foreground tracking-tight">
              Notes &amp; Quotes
            </h2>
            <p className="mt-3 text-foreground/75 font-sans text-base leading-relaxed font-light">
              Hold the sentences that stopped you mid-page, preserved alongside
              your own marginal reflections.
            </p>
          </div>

          {/* Visual Hint: Typographic quote motif in Fraunces serif */}
          <div className="mt-8 pt-6 border-t border-foreground/10">
            <span
              className="font-serif text-5xl sm:text-6xl text-secondary/40 select-none leading-none block -mb-2"
              aria-hidden="true"
            >
              &ldquo;
            </span>
            <p className="font-serif italic text-foreground/60 text-sm sm:text-base leading-relaxed pl-4 border-l border-secondary/30">
              The margin is where the reader answers the author.
            </p>
          </div>
        </div>

        {/* 3. Year in Books — Asymmetric wide preview band spanning 12 columns */}
        <div className="md:col-span-12 rounded-lg border border-foreground/10 bg-card/[0.03] p-7 sm:p-9 flex flex-col md:flex-row md:items-center justify-between gap-8 hover:border-foreground/20 hover:bg-card/[0.05] transition-colors duration-200">
          <div className="max-w-xl">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-foreground tracking-tight">
              Year in Books
            </h2>
            <p className="mt-3 text-foreground/75 font-sans text-base leading-relaxed font-light">
              When the calendar turns, watch your reading assemble into a
              lasting portrait of the titles, pages, and passages that shaped your
              year.
            </p>
          </div>

          {/* Visual Hint: Oversized stat teaser without charts or clipart */}
          <div className="flex items-baseline gap-6 sm:gap-8 border-t md:border-t-0 md:border-l border-foreground/10 pt-6 md:pt-0 md:pl-10 shrink-0">
            <div>
              <div className="font-serif text-4xl sm:text-5xl font-normal text-foreground tracking-tight">
                38
              </div>
              <div className="mt-1 text-xs font-sans text-foreground/50 font-light">
                volumes read
              </div>
            </div>
            <div className="h-8 w-px bg-foreground/10" aria-hidden="true" />
            <div>
              <div className="font-serif text-4xl sm:text-5xl font-normal text-secondary tracking-tight">
                142
              </div>
              <div className="mt-1 text-xs font-sans text-foreground/50 font-light">
                passages kept
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
