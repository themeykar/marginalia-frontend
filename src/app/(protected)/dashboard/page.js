"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

function getSpineStyles(book) {
  const seed = (Number(book.id) || 0) + (book.title ? book.title.length : 0);

  const heightClasses = [
    "h-44 sm:h-48",
    "h-52 sm:h-56",
    "h-48 sm:h-52",
    "h-56 sm:h-60",
    "h-46 sm:h-50",
  ];
  const widthClasses = [
    "w-11 sm:w-12",
    "w-13 sm:w-15",
    "w-12 sm:w-14",
    "w-14 sm:w-16",
    "w-12 sm:w-13",
  ];

  return {
    heightClass: heightClasses[seed % heightClasses.length],
    widthClass: widthClasses[seed % widthClasses.length],
  };
}

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const [books, setBooks] = useState([]);
  const [isLoadingBooks, setIsLoadingBooks] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchUser() {
      try {
        const res = await apiFetch("/api/auth/me/");
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setUser(data);
          }
        }
      } catch (err) {
        // Handled silently; ProtectedLayout handles auth redirection if token is invalid
      } finally {
        if (isMounted) {
          setIsLoadingUser(false);
        }
      }
    }

    async function fetchBooks() {
      try {
        const res = await apiFetch("/api/books/");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && isMounted) {
            setBooks(data);
          }
        }
      } catch (err) {
        // Handled silently
      } finally {
        if (isMounted) {
          setIsLoadingBooks(false);
        }
      }
    }

    fetchUser();
    fetchBooks();

    return () => {
      isMounted = false;
    };
  }, []);

  // Client-side grouping by status
  const readingBooks = books.filter((b) => b.status === "reading");
  const wantToReadBooks = books.filter((b) => b.status === "want_to_read");
  const readBooks = books.filter((b) => b.status === "read");

  const shelfSections = [
    {
      id: "reading",
      title: "Reading",
      books: readingBooks,
      emptyMessage:
        "Nothing currently open on your nightstand. When you begin your next book, its spine will rest here.",
    },
    {
      id: "want_to_read",
      title: "Want to Read",
      books: wantToReadBooks,
      emptyMessage:
        "Your future reading waits quietly. Volumes to seek out and keep close will gather here.",
    },
    {
      id: "read",
      title: "Read",
      books: readBooks,
      emptyMessage:
        "No finished pages in the ledger yet. Each completed volume leaves its mark here over the seasons.",
    },
  ];

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-6 sm:px-8 py-10 sm:py-16">
      {/* Header section with warm personalized greeting (preserved from Step 6) */}
      <section className="max-w-3xl">
        {isLoadingUser ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-28 bg-foreground/10 rounded" />
            <div className="h-10 sm:h-12 w-80 bg-foreground/10 rounded" />
            <div className="h-5 w-full max-w-lg bg-foreground/10 rounded" />
          </div>
        ) : (
          <div>
            <div className="inline-flex items-center gap-2 mb-4 px-2.5 py-1 rounded border border-foreground/10 bg-card/[0.03] text-[11px] font-sans tracking-widest uppercase text-foreground/60">
              <span className="w-1.5 h-1.5 rounded-full bg-status-reading" />
              <span>Reader&apos;s Ledger</span>
            </div>

            <h1 className="font-serif font-normal text-3xl sm:text-4xl md:text-5xl text-foreground leading-[1.15] tracking-tight">
              Welcome back, {user?.username || "reader"}.
            </h1>

            <p className="mt-4 max-w-xl text-base sm:text-lg text-foreground/75 font-sans font-light leading-relaxed">
              Your personal reading ledger is open. Record what you read,
              preserve the lines that moved you, and watch your shelf assemble
              over time.
            </p>
          </div>
        )}
      </section>

      {/* Shelf Header Bar with "Add a book" entry point */}
      <div className="mt-12 sm:mt-16 flex items-center justify-between">
        <span className="font-serif italic text-sm text-foreground/50">
          The Shelf
        </span>
        <Link
          href="/books/new"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-sans font-medium text-foreground/80 hover:text-foreground bg-card/[0.04] hover:bg-card/[0.08] border border-foreground/15 hover:border-foreground/30 px-3 py-1.5 rounded transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
        >
          <span className="text-secondary text-base leading-none">+</span>
          <span>Add a book</span>
        </Link>
      </div>

      {/* The Shelf: 3 Status Sections (Reading, Want to Read, Read) */}
      <div className="mt-6 space-y-12 sm:space-y-16">
        {shelfSections.map((section) => (
          <section key={section.id} className="pt-8 border-t border-foreground/10">
            {/* Section Heading */}
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-foreground tracking-tight">
                {section.title}
              </h2>
            </div>

            {/* Content: Bookshelf or On-Voice Empty State */}
            {isLoadingBooks ? (
              <div className="flex items-end gap-3 sm:gap-4 pt-6 pb-2 border-b border-foreground/10">
                <div className="h-44 w-12 bg-foreground/5 rounded-t-[3px] animate-pulse" />
                <div className="h-52 w-14 bg-foreground/5 rounded-t-[3px] animate-pulse" />
                <div className="h-48 w-11 bg-foreground/5 rounded-t-[3px] animate-pulse" />
              </div>
            ) : section.books.length === 0 ? (
              <p className="font-serif italic text-foreground/50 text-sm sm:text-base leading-relaxed max-w-xl py-4">
                {section.emptyMessage}
              </p>
            ) : (
              <div>
                {/* Horizontal bookshelf row */}
                <div className="flex items-end gap-3 sm:gap-4 overflow-x-auto pb-3 pt-4 px-1">
                  {section.books.map((book) => {
                    const { heightClass, widthClass } = getSpineStyles(book);

                    return (
                      <Link
                        key={book.id}
                        href={`/books/${book.id}`}
                        className="group flex flex-col items-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 rounded"
                      >
                        {/* Book spine */}
                        <div
                          className={`${heightClass} ${widthClass} rounded-t-[3px] border-t border-r border-l border-foreground/15 shadow-sm group-hover:-translate-y-1.5 group-hover:shadow-md group-active:scale-[0.98] transition-all duration-160 relative overflow-hidden flex flex-col justify-between p-1.5`}
                          style={{
                            backgroundColor: book.cover_url
                              ? undefined
                              : book.cover_color || "var(--color-primary)",
                            backgroundImage: book.cover_url
                              ? `url(${book.cover_url})`
                              : undefined,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        >
                          {/* Top decorative headband rib */}
                          <div className="w-full h-1 border-t border-b border-foreground/20 opacity-40 shrink-0" />

                          {/* Vertical title on the spine */}
                          <div className="flex-1 flex items-center justify-center overflow-hidden py-1">
                            <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] sm:text-xs font-serif text-card font-medium tracking-tight truncate max-h-full drop-shadow-xs select-none">
                              {book.title}
                            </span>
                          </div>

                          {/* Bottom decorative headband rib */}
                          <div className="w-full h-1 border-t border-b border-foreground/20 opacity-40 shrink-0" />
                        </div>

                        {/* Text below spine: Title & Author */}
                        <div className="mt-2.5 text-center max-w-[5rem] sm:max-w-[6rem] px-0.5">
                          <p className="font-serif text-xs text-foreground line-clamp-2 leading-snug group-hover:text-secondary transition-colors duration-150">
                            {book.title}
                          </p>
                          {book.author && (
                            <p className="font-sans text-[11px] text-foreground/55 font-light line-clamp-1 mt-0.5">
                              {book.author}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Shelf baseline ledge */}
                <div className="h-1 w-full bg-foreground/15 rounded-xs mt-1" />
              </div>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
