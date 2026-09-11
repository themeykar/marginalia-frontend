"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { apiFetch } from "@/lib/api";

/**
 * Date Gate: Year in Books is unlocked December 15 – December 31 (inclusive).
 * Clearly exposed at the top of the component so it is easy to find and
 * temporarily bypass (e.g. change to `return true;`) for manual testing.
 *
 * @param {Date} date
 * @returns {boolean}
 */
export function isWithinRevealWindow(date = new Date()) {
  const month = date.getMonth(); // 0-indexed: 11 = December
  const day = date.getDate();
  return month === 11 && day >= 15 && day <= 31;
}

const SLIDE_DURATION_MS = 4500;
const TICK_INTERVAL_MS = 50;

export default function YearInBooksPage() {
  const router = useRouter();
  const shouldReduceMotion = useReducedMotion();

  // Date Gate State
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasCheckedGate, setHasCheckedGate] = useState(false);

  // API Data State
  const [wrapup, setWrapup] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Story Slides State
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isPaused, setIsPaused] = useState(false);

  // Check gate on mount
  useEffect(() => {
    const unlocked = isWithinRevealWindow();
    setIsUnlocked(unlocked);
    setHasCheckedGate(true);
  }, []);

  // Fetch /api/wrapup/ ONLY if within reveal window
  useEffect(() => {
    if (!hasCheckedGate || !isUnlocked) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    async function fetchWrapup() {
      try {
        const res = await apiFetch("/api/wrapup/");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setWrapup(data);
          }
        }
      } catch {
        // Handled silently
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchWrapup();

    return () => {
      isMounted = false;
    };
  }, [hasCheckedGate, isUnlocked]);

  // Build the array of active slides based on the API contract
  // strictly FILTERING OUT any slide whose required data is null, missing, or empty
  const slides = useMemo(() => {
    if (!wrapup) return [];

    const list = [];

    // 1. Total Books
    if (typeof wrapup.total_books === "number") {
      list.push({
        id: "total_books",
        rubric: "Annual Ledger",
        headline: String(wrapup.total_books),
        sublabel: wrapup.total_books === 1 ? "volume completed" : "volumes completed",
        copy: "Spines that entered your hands, accompanied your evenings, and now rest finished on your shelf.",
      });
    }

    // 2. Total Pages
    if (typeof wrapup.total_pages === "number") {
      list.push({
        id: "total_pages",
        rubric: "Depth of Reading",
        headline: Number(wrapup.total_pages).toLocaleString(),
        sublabel: "pages turned",
        copy: "Pages moved quietly by lamplight, sentence after sentence, each chapter adding its weight to your memory.",
      });
    }

    // 3. Favorite Genre (ONLY if a valid, non-empty string that is not "null" or "none")
    if (
      wrapup.favorite_genre &&
      typeof wrapup.favorite_genre === "string" &&
      wrapup.favorite_genre.trim() !== "" &&
      wrapup.favorite_genre.trim().toLowerCase() !== "null" &&
      wrapup.favorite_genre.trim().toLowerCase() !== "none"
    ) {
      list.push({
        id: "favorite_genre",
        rubric: "The Common Thread",
        headline: wrapup.favorite_genre.trim(),
        sublabel: "most-visited territory",
        copy: "The shelf you returned to most often when looking for clarity, story, and refuge.",
      });
    }

    // 4. Longest Book (ONLY if a valid object with title)
    if (
      wrapup.longest_book &&
      typeof wrapup.longest_book === "object" &&
      wrapup.longest_book.title &&
      String(wrapup.longest_book.title).trim() !== ""
    ) {
      list.push({
        id: "longest_book",
        rubric: "The Deepest Journey",
        book: wrapup.longest_book,
        sublabel: `${wrapup.longest_book.page_count || 0} pages`,
        copy: "The most expansive world you inhabited this year — an enduring commitment of attention.",
      });
    }

    // 5. Most Quoted Book (ONLY if a valid object with title and quote_count > 0)
    if (
      wrapup.most_quoted_book &&
      typeof wrapup.most_quoted_book === "object" &&
      wrapup.most_quoted_book.title &&
      String(wrapup.most_quoted_book.title).trim() !== "" &&
      Number(wrapup.most_quoted_book.quote_count) > 0
    ) {
      const count = Number(wrapup.most_quoted_book.quote_count);
      list.push({
        id: "most_quoted_book",
        rubric: "The Most Resonant Voice",
        book: wrapup.most_quoted_book,
        sublabel: `${count} ${count === 1 ? "passage" : "passages"} preserved`,
        copy: "The author whose lines stopped you most often, recorded in the margin to answer back.",
      });
    }

    // 6. Reading Streak
    if (typeof wrapup.reading_streak === "number") {
      list.push({
        id: "reading_streak",
        rubric: "Reading Rhythm",
        headline: String(wrapup.reading_streak),
        sublabel: "consecutive days in company",
        copy: "Another year lived in the company of authors, gathered line by line into your personal archive.",
      });
    }

    return list;
  }, [wrapup]);

  const totalSlides = slides.length;

  // Clamp currentSlideIndex strictly within bounds [0, totalSlides - 1]
  const safeIndex = totalSlides > 0 ? Math.max(0, Math.min(currentSlideIndex, totalSlides - 1)) : 0;
  const isFinalSlide = totalSlides > 0 && safeIndex === totalSlides - 1;
  const currentSlide = slides[safeIndex] || null;

  // Sync index if totalSlides shrunk below currentSlideIndex
  useEffect(() => {
    if (totalSlides > 0 && currentSlideIndex >= totalSlides) {
      setCurrentSlideIndex(totalSlides - 1);
    }
  }, [totalSlides, currentSlideIndex]);

  // Check if every stat is zero / empty (brand new account)
  const isCompletelyEmptyAccount = useMemo(() => {
    if (!wrapup) return false;
    return (
      (wrapup.total_books || 0) === 0 &&
      (wrapup.total_pages || 0) === 0 &&
      !wrapup.favorite_genre &&
      (!wrapup.longest_book || !wrapup.longest_book.title) &&
      (!wrapup.most_quoted_book || !wrapup.most_quoted_book.title) &&
      (wrapup.reading_streak || 0) === 0
    );
  }, [wrapup]);

  // Advance to next slide with strict upper bound
  const handleNext = useCallback(() => {
    setCurrentSlideIndex((prev) => {
      if (prev < totalSlides - 1) {
        return prev + 1;
      }
      return prev; // Clamp at final slide, never overflow
    });
    setProgress(0);
  }, [totalSlides]);

  // Go to previous slide with strict lower bound
  const handlePrev = useCallback(() => {
    setCurrentSlideIndex((prev) => Math.max(0, prev - 1));
    setProgress(0);
  }, []);

  // Back to shelf navigation: stop propagation & prevent default so tap zones never catch the event
  const handleBackToShelf = (e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push("/dashboard");
  };

  // Timer: auto-advancing slides with stories progress bar
  // Crucial: on reaching the LAST slide, the timer is NOT started (or cleaned up immediately)
  useEffect(() => {
    if (!isUnlocked || isLoading || totalSlides === 0 || isPaused || isFinalSlide) {
      if (isFinalSlide) {
        setProgress(100);
      }
      return;
    }

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (TICK_INTERVAL_MS / SLIDE_DURATION_MS) * 100;
        if (next >= 100) {
          return 100;
        }
        return next;
      });
    }, TICK_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isUnlocked, isLoading, totalSlides, isPaused, isFinalSlide]);

  // When progress reaches 100%, trigger advancement in a separate effect
  // strictly guarded so it can never trigger on or past the final slide
  useEffect(() => {
    if (progress >= 100 && currentSlideIndex < totalSlides - 1) {
      setCurrentSlideIndex((prev) => Math.min(prev + 1, totalSlides - 1));
      setProgress(0);
    }
  }, [progress, currentSlideIndex, totalSlides]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev]);

  // 1. LOCKED / ANTICIPATION STATE (Outside December 15–31)
  if (hasCheckedGate && !isUnlocked) {
    return (
      <div className="flex-1 max-w-3xl w-full mx-auto px-6 sm:px-8 py-16 sm:py-24 flex flex-col items-center justify-center text-center">
        <div className="rounded-xl border border-foreground/10 bg-card/[0.02] p-8 sm:p-14 max-w-xl w-full shadow-sm">
          <div className="w-12 h-12 rounded-full border border-foreground/15 bg-card/[0.04] flex items-center justify-center mx-auto mb-6 text-secondary">
            <svg
              className="w-6 h-6"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
              />
            </svg>
          </div>

          <span className="font-serif italic text-xs sm:text-sm text-foreground/50 tracking-wider uppercase block mb-2">
            The Annual Reveal
          </span>

          <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-normal tracking-tight mb-4">
            Your year is still being written.
          </h1>

          <p className="font-sans text-sm sm:text-base font-light text-foreground/75 leading-relaxed max-w-md mx-auto mb-8">
            The ledger closes and reveals its annual portrait between December 15
            and December 31. Until then, continue turning pages, noting lines
            that linger, and letting your shelf gather volume.
          </p>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-card/[0.06] hover:bg-card/[0.12] border border-foreground/15 px-5 py-2.5 text-xs sm:text-sm font-sans font-medium text-foreground transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
          >
            &larr; Return to your shelf
          </Link>
        </div>
      </div>
    );
  }

  // 2. LOADING STATE (Inside window, waiting for API)
  if (isLoading) {
    return (
      <div className="flex-1 max-w-2xl w-full mx-auto px-6 sm:px-8 py-16 sm:py-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-placeholder.png"
            alt="Marginalia"
            className="h-8 w-auto object-contain opacity-60 animate-pulse"
          />
          <span className="font-serif italic text-xs text-foreground/50 tracking-wider">
            Assembling your year in books...
          </span>
        </div>
      </div>
    );
  }

  // 3. BRAND NEW ACCOUNT EMPTY STATE (Within window, but all stats zero/null)
  if (isCompletelyEmptyAccount || totalSlides === 0 || !currentSlide) {
    return (
      <div className="flex-1 max-w-3xl w-full mx-auto px-6 sm:px-8 py-16 sm:py-24 flex flex-col items-center justify-center text-center">
        <div className="rounded-xl border border-foreground/10 bg-card/[0.02] p-8 sm:p-14 max-w-xl w-full shadow-sm">
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-normal tracking-tight mb-4">
            Your year is still being written.
          </h1>

          <p className="font-sans text-sm sm:text-base font-light text-foreground/75 leading-relaxed max-w-md mx-auto mb-8">
            As you finish volumes and keep notes, your annual portrait will take
            shape here. Open your first book to begin.
          </p>

          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-card/[0.06] hover:bg-card/[0.12] border border-foreground/15 px-5 py-2.5 text-xs sm:text-sm font-sans font-medium text-foreground transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
          >
            &larr; Return to your shelf
          </Link>
        </div>
      </div>
    );
  }

  // 4. SIGNATURE REVEAL SLIDESHOW
  return (
    <div className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-14 flex flex-col justify-center items-center">
      {/* Stories-style Container */}
      <div className="w-full max-w-2xl rounded-xl border border-foreground/10 bg-card/[0.02] p-6 sm:p-10 lg:p-12 relative overflow-hidden shadow-lg min-h-[480px] sm:min-h-[520px] flex flex-col justify-between">
        {/* Invisible Tap Zones: Left 1/3 = back, Right 2/3 = forward */}
        <div
          onClick={handlePrev}
          className="absolute left-0 top-16 bottom-0 w-1/3 z-10 cursor-pointer"
          aria-label="Previous slide"
        />
        <div
          onClick={handleNext}
          className="absolute right-0 top-16 bottom-0 w-2/3 z-10 cursor-pointer"
          aria-label="Next slide"
        />

        {/* Top Header: Stories Segmented Progress Bar & Controls */}
        <div className="relative z-30 mb-8">
          {/* Segmented Progress Bars based strictly on filtered totalSlides */}
          <div className="flex items-center gap-1.5 w-full mb-4">
            {slides.map((_, idx) => {
              const isPassed = idx < safeIndex;
              const isCurrent = idx === safeIndex;
              return (
                <div
                  key={idx}
                  className="h-1 flex-1 bg-foreground/15 rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-secondary transition-all"
                    style={{
                      width: isPassed
                        ? "100%"
                        : isCurrent
                          ? `${isFinalSlide ? 100 : progress}%`
                          : "0%",
                      transitionDuration: isPaused ? "0ms" : "50ms",
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between">
            <span className="font-serif italic text-xs text-foreground/50 tracking-widest uppercase">
              Year in Books &middot; {safeIndex + 1} of {totalSlides}
            </span>

            <div className="flex items-center gap-3">
              {/* Play / Pause Toggle Button */}
              {!isFinalSlide && (
                <button
                  type="button"
                  onClick={() => setIsPaused((prev) => !prev)}
                  className="text-xs font-sans text-foreground/60 hover:text-foreground transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
                  aria-label={isPaused ? "Play reveal slideshow" : "Pause reveal slideshow"}
                >
                  {isPaused ? "Play" : "Pause"}
                </button>
              )}

              {/* Close / Return Link */}
              <Link
                href="/dashboard"
                className="text-xs font-sans text-foreground/60 hover:text-foreground transition-colors p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
                aria-label="Close and return to shelf"
              >
                &times; Close
              </Link>
            </div>
          </div>
        </div>

        {/* Slide Content Area (Motion-budgeted transition) */}
        <div className="relative z-20 flex-1 flex flex-col justify-center my-auto py-4 pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={
                shouldReduceMotion
                  ? { opacity: 1 }
                  : { opacity: 0, y: 16 }
              }
              animate={{ opacity: 1, y: 0 }}
              exit={
                shouldReduceMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: -12 }
              }
              transition={{
                duration: 0.45,
                ease: [0.23, 1, 0.32, 1], // Strong ease-out per emil-design-eng
              }}
              className="w-full flex flex-col justify-center"
            >
              {/* Rubric Badge */}
              <div className="inline-flex items-center gap-2 mb-4 px-2.5 py-1 rounded border border-foreground/10 bg-card/[0.03] text-[11px] font-sans tracking-widest uppercase text-foreground/60 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-status-reading" />
                <span>{currentSlide.rubric}</span>
              </div>

              {/* Slide variation: Book Feature (Longest or Most Quoted) */}
              {currentSlide.book ? (
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 my-3">
                  {/* Book Cover / Spine */}
                  <div className="shrink-0">
                    {currentSlide.book.cover_url ? (
                      <div className="w-28 sm:w-32 rounded overflow-hidden border border-foreground/15 shadow-md">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={currentSlide.book.cover_url}
                          alt={currentSlide.book.title}
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className="w-28 sm:w-32 aspect-[2/3] rounded border border-foreground/20 shadow-md p-3 flex flex-col justify-between text-center"
                        style={{
                          backgroundColor:
                            currentSlide.book.cover_color || "var(--color-primary)",
                        }}
                      >
                        <div className="w-full h-0.5 border-t border-foreground/25" />
                        <span className="font-serif text-xs text-card line-clamp-3 leading-snug">
                          {currentSlide.book.title}
                        </span>
                        <div className="w-full h-0.5 border-t border-foreground/25" />
                      </div>
                    )}
                  </div>

                  {/* Book Details & Copy */}
                  <div>
                    <h2 className="font-serif text-2xl sm:text-3xl text-foreground font-normal leading-tight tracking-tight">
                      {currentSlide.book.title}
                    </h2>
                    <p className="mt-1 font-sans text-sm sm:text-base text-foreground/75 font-light">
                      by {currentSlide.book.author}
                    </p>

                    <div className="mt-3 inline-block font-sans text-sm font-medium text-secondary">
                      {currentSlide.sublabel}
                    </div>

                    <p className="mt-4 font-serif italic text-foreground/70 text-sm sm:text-base leading-relaxed max-w-md">
                      {currentSlide.copy}
                    </p>
                  </div>
                </div>
              ) : (
                /* Slide variation: Large Stat or Genre Reveal */
                <div>
                  <div className="font-serif text-6xl sm:text-7xl md:text-8xl text-foreground font-normal tracking-tight leading-none">
                    {currentSlide.headline}
                  </div>

                  <div className="mt-3 font-sans text-sm sm:text-base font-light text-secondary tracking-wide">
                    {currentSlide.sublabel}
                  </div>

                  <p className="mt-6 font-serif italic text-foreground/75 text-base sm:text-lg leading-relaxed max-w-md">
                    {currentSlide.copy}
                  </p>
                </div>
              )}

              {/* Final Slide Call-to-Action */}
              {isFinalSlide && (
                <div className="mt-8 pt-6 border-t border-foreground/10 relative z-30 pointer-events-auto">
                  <Link
                    href="/dashboard"
                    onClick={handleBackToShelf}
                    className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm sm:text-base font-sans font-medium text-card hover:bg-primary/90 transition-all duration-150 active:scale-[0.98] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 cursor-pointer"
                  >
                    Back to your shelf &rarr;
                  </Link>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Helper Bar */}
        <div className="relative z-30 pt-4 border-t border-foreground/10 flex items-center justify-between text-xs font-sans text-foreground/40 font-light">
          <span>Tap left to rewind &middot; Tap right to advance</span>
          <span className="hidden sm:inline">Space to pause</span>
        </div>
      </div>
    </div>
  );
}
