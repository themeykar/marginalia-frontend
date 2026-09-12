"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

function formatReadableDate(dateString) {
  if (!dateString) return null;
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const [year, month, day] = dateString.split("-").map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
}

export default function BookDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  // Book state
  const [book, setBook] = useState(null);
  const [isLoadingBook, setIsLoadingBook] = useState(true);
  const [bookError, setBookError] = useState("");

  // Notes state
  const [notes, setNotes] = useState([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);

  // Book deletion state
  const [isConfirmingBookDelete, setIsConfirmingBookDelete] = useState(false);
  const [isDeletingBook, setIsDeletingBook] = useState(false);

  // New note form state
  const [newEntryType, setNewEntryType] = useState("quote");
  const [newContent, setNewContent] = useState("");
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [noteFormError, setNoteFormError] = useState("");

  // Note inline editing & deletion state
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);
  const [isDeletingNote, setIsDeletingNote] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchBookData() {
      if (!id) return;

      try {
        const res = await apiFetch(`/api/books/${id}/`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setBook(data);
          }
        } else {
          if (isMounted) {
            // Ownership: 404 treated as "not found"
            setBookError("This volume could not be found in your ledger.");
          }
        }
      } catch {
        if (isMounted) {
          setBookError("Unable to connect to your ledger. Please try again.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingBook(false);
        }
      }
    }

    async function fetchNotesData() {
      if (!id) return;

      try {
        const res = await apiFetch(`/api/books/${id}/notes/`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && isMounted) {
            // Ordered oldest-first from backend — preserve chronological journal order
            setNotes(data);
          }
        }
      } catch {
        // Handled silently
      } finally {
        if (isMounted) {
          setIsLoadingNotes(false);
        }
      }
    }

    fetchBookData();
    fetchNotesData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  // Book delete action
  const handleDeleteBook = async () => {
    setIsDeletingBook(true);
    try {
      const res = await apiFetch(`/api/books/${id}/`, {
        method: "DELETE",
      });
      if (res.status === 204 || res.ok) {
        router.push("/dashboard");
        return;
      }
    } catch {
      // Handled silently
    } finally {
      setIsDeletingBook(false);
      setIsConfirmingBookDelete(false);
    }
  };

  // Add new note / quote action
  const handleCreateNote = async (e) => {
    e.preventDefault();
    const contentTrimmed = newContent.trim();
    if (!contentTrimmed) return;

    setIsSubmittingNote(true);
    setNoteFormError("");

    try {
      const res = await apiFetch(`/api/books/${id}/notes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: contentTrimmed,
          entry_type: newEntryType,
        }),
      });

      if (res.status === 201 || res.ok) {
        const createdNote = await res.json();
        setNotes((prev) => [...prev, createdNote]);
        setNewContent("");
      } else {
        setNoteFormError("Unable to save entry. Please try again.");
      }
    } catch {
      setNoteFormError("Network error. Please check your connection.");
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Inline note editing
  const startEditingNote = (note) => {
    setEditingNoteId(note.id);
    setEditContent(note.content);
    setDeletingNoteId(null);
  };

  const handleSaveNoteEdit = async (noteId) => {
    const trimmed = editContent.trim();
    if (!trimmed) return;

    setIsSavingEdit(true);
    try {
      const res = await apiFetch(`/api/books/${id}/notes/${noteId}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: trimmed,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setNotes((prev) =>
          prev.map((n) => (n.id === noteId ? { ...n, content: updated.content } : n))
        );
        setEditingNoteId(null);
        setEditContent("");
      }
    } catch {
      // Handled silently
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Note deletion
  const handleDeleteNote = async (noteId) => {
    setIsDeletingNote(true);
    try {
      const res = await apiFetch(`/api/books/${id}/notes/${noteId}/`, {
        method: "DELETE",
      });

      if (res.status === 204 || res.ok) {
        setNotes((prev) => prev.filter((n) => n.id !== noteId));
        setDeletingNoteId(null);
      }
    } catch {
      // Handled silently
    } finally {
      setIsDeletingNote(false);
    }
  };

  // Status human-readable labels
  const statusLabels = {
    reading: "Reading",
    want_to_read: "Want to Read",
    read: "Read",
  };

  if (isLoadingBook) {
    return (
      <div className="flex-1 max-w-5xl w-full min-w-0 mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-14 animate-pulse">
        <div className="h-4 w-28 bg-foreground/10 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4 aspect-[2/3] max-w-[260px] bg-foreground/10 rounded-md" />
          <div className="md:col-span-8 space-y-4">
            <div className="h-5 w-24 bg-foreground/10 rounded" />
            <div className="h-10 w-80 bg-foreground/10 rounded" />
            <div className="h-6 w-48 bg-foreground/10 rounded" />
            <div className="h-20 w-full bg-card/[0.02] border border-foreground/10 rounded-md mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (bookError || !book) {
    return (
      <div className="flex-1 max-w-5xl w-full min-w-0 mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-16 text-center">
        <div className="rounded-lg border border-foreground/10 bg-card/[0.02] p-6 sm:p-12 max-w-md mx-auto">
          <h1 className="font-serif text-2xl text-foreground font-normal mb-2 break-words">
            Volume Not Found
          </h1>
          <p className="text-sm font-sans text-foreground/60 mb-6 break-words">
            {bookError || "The volume you requested is not available in your ledger."}
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md bg-card/[0.08] hover:bg-card/[0.14] px-4 py-2 text-sm font-sans text-foreground transition-colors"
          >
            &larr; Return to Shelf
          </Link>
        </div>
      </div>
    );
  }

  const startDateFormatted = formatReadableDate(book.date_started);
  const finishDateFormatted = formatReadableDate(book.date_finished);

  return (
    <div className="flex-1 max-w-5xl w-full min-w-0 mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-12">
      {/* Top Breadcrumb Navigation */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-sans text-foreground/60 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 rounded px-1 py-0.5"
        >
          &larr; Back to shelf
        </Link>
      </div>

      {/* 1. METADATA SECTION */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 items-start pb-12 sm:pb-16 border-b border-foreground/10">
        {/* Book Cover (Left column) */}
        <div className="md:col-span-4 flex justify-center md:justify-start">
          {book.cover_url ? (
            <div className="w-full max-w-[240px] sm:max-w-[260px] rounded-md overflow-hidden border border-foreground/15 shadow-md bg-foreground/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-full h-auto object-cover max-h-[380px]"
              />
            </div>
          ) : (
            /* Spine-colored cover block fallback */
            <div
              className="w-full aspect-[2/3] max-w-[240px] sm:max-w-[260px] rounded-md border border-foreground/20 shadow-md p-6 flex flex-col justify-between relative overflow-hidden"
              style={{ backgroundColor: book.cover_color || "var(--color-primary)" }}
            >
              <div className="w-full h-1 border-t border-b border-foreground/25 opacity-50 shrink-0" />
              <div className="text-center my-auto px-2">
                <h2 className="font-serif text-xl sm:text-2xl text-card font-medium leading-snug drop-shadow-sm break-words">
                  {book.title}
                </h2>
                <p className="mt-2 font-sans text-xs text-card/80 font-light break-words">
                  {book.author}
                </p>
              </div>
              <div className="w-full h-1 border-t border-b border-foreground/25 opacity-50 shrink-0" />
            </div>
          )}
        </div>

        {/* Book Information & Actions (Right column) */}
        <div className="md:col-span-8 flex flex-col justify-between min-w-0">
          <div>
            {/* Status Indicator */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded border border-foreground/10 bg-card/[0.03] text-xs font-sans text-foreground/70 mb-3">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  book.status === "reading"
                    ? "bg-status-reading"
                    : book.status === "read"
                    ? "bg-secondary"
                    : "bg-foreground/40"
                }`}
              />
              <span>{statusLabels[book.status] || book.status}</span>
            </div>

            {/* Title & Author */}
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-normal text-foreground leading-[1.15] tracking-tight break-words">
              {book.title}
            </h1>
            <p className="mt-2 font-sans text-lg sm:text-xl text-foreground/75 font-light break-words">
              by {book.author}
            </p>

            {/* Rating if set */}
            {book.rating && (
              <div className="mt-4 flex items-center gap-1.5 text-secondary">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className={`w-5 h-5 ${
                      star <= book.rating
                        ? "fill-current text-secondary"
                        : "text-foreground/15 fill-current"
                    }`}
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                ))}
                <span className="ml-2 text-xs font-sans text-foreground/50">
                  {book.rating} / 5
                </span>
              </div>
            )}

            {/* Book Details (Genre, Pages, Dates) */}
            <div className="mt-6 pt-5 border-t border-foreground/10 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs sm:text-sm font-sans">
              {book.genre && (
                <div>
                  <span className="block text-foreground/40 font-light mb-1">
                    Genre
                  </span>
                  <span className="text-foreground/80 font-medium">
                    {book.genre}
                  </span>
                </div>
              )}

              {book.page_count && (
                <div>
                  <span className="block text-foreground/40 font-light mb-1">
                    Pages
                  </span>
                  <span className="text-foreground/80 font-medium">
                    {book.page_count} pages
                  </span>
                </div>
              )}

              {(startDateFormatted || finishDateFormatted) && (
                <div className="col-span-2 sm:col-span-1">
                  <span className="block text-foreground/40 font-light mb-1">
                    Timeline
                  </span>
                  <span className="text-foreground/80 font-medium leading-relaxed">
                    {startDateFormatted && finishDateFormatted
                      ? `${startDateFormatted} – ${finishDateFormatted}`
                      : startDateFormatted
                      ? `Started ${startDateFormatted}`
                      : `Finished ${finishDateFormatted}`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Metadata Action Bar (Edit & Delete) */}
          <div className="mt-8 pt-6 border-t border-foreground/10 flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
            <Link
              href={`/books/${id}/edit`}
              className="inline-flex items-center justify-center rounded-md bg-card/[0.08] hover:bg-card/[0.14] px-4 py-2 text-xs sm:text-sm font-sans font-medium text-foreground border border-foreground/15 transition-all duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 shrink-0"
            >
              Edit volume
            </Link>

            {/* Destructive Delete Confirmation Flow */}
            {isConfirmingBookDelete ? (
              <div className="flex items-center flex-wrap gap-2 sm:gap-3 p-2.5 sm:p-2 rounded-md bg-primary/20 border border-primary/40 max-w-full">
                <span className="text-xs font-sans text-foreground/90 w-full sm:w-auto">
                  Are you sure? This cannot be undone.
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteBook}
                    disabled={isDeletingBook}
                    className="px-2.5 py-1 text-xs font-sans font-medium bg-primary text-card hover:bg-primary/90 rounded transition-all active:scale-[0.95] disabled:opacity-50 shrink-0"
                  >
                    {isDeletingBook ? "Deleting..." : "Confirm delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsConfirmingBookDelete(false)}
                    disabled={isDeletingBook}
                    className="text-xs font-sans text-foreground/60 hover:text-foreground transition-colors px-1 shrink-0"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsConfirmingBookDelete(true)}
                className="text-xs sm:text-sm font-sans text-foreground/50 hover:text-foreground/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 rounded px-1 py-0.5 shrink-0"
              >
                Delete this book
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 2. NOTES & QUOTES SECTION */}
      <section className="mt-12 sm:mt-16">
        <div className="flex items-baseline justify-between mb-8 flex-wrap gap-2">
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-foreground tracking-tight break-words">
              Notes &amp; Quotes
            </h2>
            <p className="mt-1 text-xs sm:text-sm font-sans font-light text-foreground/60 break-words">
              Passages that caught your eye and reflections recorded along the way.
            </p>
          </div>
          {notes.length > 0 && (
            <span className="text-xs font-sans text-foreground/45 font-light shrink-0">
              {notes.length} {notes.length === 1 ? "entry" : "entries"}
            </span>
          )}
        </div>

        {/* Existing Entries List (Chronological / Oldest First) */}
        {isLoadingNotes ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-20 w-full bg-card/[0.02] border border-foreground/10 rounded-lg" />
            <div className="h-20 w-full bg-card/[0.02] border border-foreground/10 rounded-lg" />
          </div>
        ) : notes.length === 0 ? (
          /* Empty state on-voice invitation */
          <div className="rounded-lg border border-foreground/10 bg-card/[0.02] p-6 sm:p-8 text-center my-6">
            <p className="font-serif italic text-foreground/55 text-sm sm:text-base max-w-md mx-auto leading-relaxed break-words">
              No passages or reflections recorded for this volume yet. Preserve a
              line that moved you or jot down a thought from the margin below.
            </p>
          </div>
        ) : (
          <div className="space-y-5 my-6">
            {notes.map((entry) => {
              const isEditing = editingNoteId === entry.id;
              const isConfirmingDelete = deletingNoteId === entry.id;

              return (
                <div
                  key={entry.id}
                  className="group relative rounded-lg border border-foreground/10 bg-card/[0.02] p-4 sm:p-6 transition-colors hover:border-foreground/20 min-w-0"
                >
                  {isEditing ? (
                    /* Inline edit mode */
                    <div className="space-y-3 min-w-0">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        rows={3}
                        className="w-full min-w-0 rounded-md p-3 text-sm sm:text-base font-sans bg-card/[0.04] text-foreground border border-foreground/20 focus-visible:border-secondary/60 focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:outline-none transition-all"
                      />
                      <div className="flex items-center justify-end flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(null);
                            setEditContent("");
                          }}
                          disabled={isSavingEdit}
                          className="text-xs font-sans text-foreground/60 hover:text-foreground transition-colors shrink-0"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveNoteEdit(entry.id)}
                          disabled={isSavingEdit || !editContent.trim()}
                          className="px-3 py-1.5 text-xs font-sans font-medium bg-primary text-card rounded hover:bg-primary/90 transition-all active:scale-[0.97] disabled:opacity-50 shrink-0"
                        >
                          {isSavingEdit ? "Saving..." : "Save changes"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Read view: Note vs Quote distinction */
                    <div className="min-w-0">
                      {entry.entry_type === "quote" ? (
                        /* Quote presentation */
                        <div className="flex items-start gap-3 min-w-0">
                          <span
                            className="font-serif text-3xl sm:text-4xl text-secondary/40 select-none leading-none -mt-1 shrink-0"
                            aria-hidden="true"
                          >
                            &ldquo;
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-serif italic text-foreground/90 text-base sm:text-lg leading-relaxed whitespace-pre-wrap pl-1 break-words [overflow-wrap:anywhere]">
                              {entry.content}
                            </p>
                            <div className="mt-3 flex items-center justify-between flex-wrap gap-2 text-xs font-sans text-foreground/45">
                              <span className="shrink-0">Kept {formatReadableDate(entry.created_at)}</span>

                              {/* Hover actions */}
                              {isConfirmingDelete ? (
                                <div className="flex items-center flex-wrap gap-2 text-xs">
                                  <span className="text-foreground/70">Delete entry?</span>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteNote(entry.id)}
                                    disabled={isDeletingNote}
                                    className="text-primary font-medium hover:underline shrink-0"
                                  >
                                    {isDeletingNote ? "Deleting..." : "Yes, delete"}
                                  </button>
                                  <span className="text-foreground/30">&middot;</span>
                                  <button
                                    type="button"
                                    onClick={() => setDeletingNoteId(null)}
                                    className="text-foreground/60 hover:text-foreground shrink-0"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <div className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center gap-3">
                                  <button
                                    type="button"
                                    onClick={() => startEditingNote(entry)}
                                    className="hover:text-foreground transition-colors"
                                  >
                                    Edit
                                  </button>
                                  <span className="text-foreground/20">&middot;</span>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setDeletingNoteId(entry.id);
                                      setEditingNoteId(null);
                                    }}
                                    className="hover:text-foreground transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Note presentation */
                        <div className="min-w-0">
                          <div className="inline-flex items-center gap-1.5 mb-2 text-[11px] font-sans tracking-wider uppercase text-foreground/50">
                            <span className="w-1.5 h-1.5 rounded-full bg-status-reading" />
                            <span>Marginal Note</span>
                          </div>
                          <p className="font-sans text-foreground/85 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-light break-words [overflow-wrap:anywhere]">
                            {entry.content}
                          </p>
                          <div className="mt-3 flex items-center justify-between flex-wrap gap-2 text-xs font-sans text-foreground/45">
                            <span className="shrink-0">Noted {formatReadableDate(entry.created_at)}</span>

                            {/* Hover actions */}
                            {isConfirmingDelete ? (
                              <div className="flex items-center flex-wrap gap-2 text-xs">
                                <span className="text-foreground/70">Delete entry?</span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteNote(entry.id)}
                                  disabled={isDeletingNote}
                                  className="text-primary font-medium hover:underline shrink-0"
                                >
                                  {isDeletingNote ? "Deleting..." : "Yes, delete"}
                                </button>
                                <span className="text-foreground/30">&middot;</span>
                                <button
                                  type="button"
                                  onClick={() => setDeletingNoteId(null)}
                                  className="text-foreground/60 hover:text-foreground shrink-0"
                                >
                                  Cancel
                                </button>
                              </div>
                            ) : (
                              <div className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity flex items-center gap-3">
                                <button
                                  type="button"
                                  onClick={() => startEditingNote(entry)}
                                  className="hover:text-foreground transition-colors"
                                >
                                  Edit
                                </button>
                                <span className="text-foreground/20">&middot;</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDeletingNoteId(entry.id);
                                    setEditingNoteId(null);
                                  }}
                                  className="hover:text-foreground transition-colors"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Add New Entry Form */}
        <div className="mt-10 pt-8 border-t border-foreground/10">
          <form
            onSubmit={handleCreateNote}
            className="rounded-lg border border-foreground/10 bg-card/[0.02] p-4 sm:p-7 min-w-0"
          >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <span className="font-serif text-lg font-normal text-foreground">
                Add an entry
              </span>

              {/* Toggle for Note vs Quote */}
              <div className="flex items-center gap-1 p-1 rounded-md bg-card/[0.05] border border-foreground/10 shrink-0">
                <button
                  type="button"
                  onClick={() => setNewEntryType("quote")}
                  className={`px-3 py-1 rounded text-xs font-sans transition-all duration-150 ${
                    newEntryType === "quote"
                      ? "bg-secondary text-background font-medium shadow-xs"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  Quote
                </button>
                <button
                  type="button"
                  onClick={() => setNewEntryType("note")}
                  className={`px-3 py-1 rounded text-xs font-sans transition-all duration-150 ${
                    newEntryType === "note"
                      ? "bg-secondary text-background font-medium shadow-xs"
                      : "text-foreground/60 hover:text-foreground"
                  }`}
                >
                  Note
                </button>
              </div>
            </div>

            {noteFormError && (
              <p className="text-xs font-sans text-secondary mb-3 break-words">
                {noteFormError}
              </p>
            )}

            <textarea
              rows={3}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder={
                newEntryType === "quote"
                  ? "Record a sentence or passage that stopped you mid-page..."
                  : "Jot down a reflection, marginal thought, or reaction..."
              }
              className="w-full min-w-0 rounded-md p-3 text-sm sm:text-base font-sans bg-card/[0.04] text-foreground placeholder:text-foreground/35 border border-foreground/15 hover:border-foreground/30 focus-visible:border-secondary/60 focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:outline-none transition-all duration-150"
            />

            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={isSubmittingNote || !newContent.trim()}
                className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-xs sm:text-sm font-sans font-medium text-card hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 shrink-0"
              >
                {isSubmittingNote
                  ? "Saving entry..."
                  : newEntryType === "quote"
                  ? "Keep passage"
                  : "Save note"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
