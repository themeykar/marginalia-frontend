"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

const SPINE_PALETTE = [
  { id: "burgundy", name: "Burgundy", hex: "#7A2E3A", bgClass: "bg-spine-burgundy" },
  { id: "sage", name: "Sage", hex: "#6B7B6E", bgClass: "bg-spine-sage" },
  { id: "gold", name: "Gold", hex: "#C9A15E", bgClass: "bg-spine-gold" },
  { id: "navy", name: "Navy", hex: "#2A3644", bgClass: "bg-spine-navy" },
  { id: "terracotta", name: "Terracotta", hex: "#9B4A38", bgClass: "bg-spine-terracotta" },
  { id: "parchment", name: "Parchment", hex: "#D8CEBC", bgClass: "bg-spine-parchment" },
];

export default function BookForm({ initialData = null, bookId = null, isEdit = false }) {
  const router = useRouter();

  // Form inputs
  const [title, setTitle] = useState(initialData?.title || "");
  const [author, setAuthor] = useState(initialData?.author || "");
  const [genre, setGenre] = useState(initialData?.genre || "");
  const [status, setStatus] = useState(initialData?.status || "want_to_read");
  const [pageCount, setPageCount] = useState(
    initialData?.page_count !== null && initialData?.page_count !== undefined
      ? String(initialData.page_count)
      : ""
  );
  const [rating, setRating] = useState(initialData?.rating || null);
  const [dateStarted, setDateStarted] = useState(initialData?.date_started || "");
  const [dateFinished, setDateFinished] = useState(initialData?.date_finished || "");

  // Cover selection: either cover_url or cover_color
  // Priority: if initialData has cover_url, use it; if cover_color, use it; else default to first palette color
  const [selectedCoverType, setSelectedCoverType] = useState(
    initialData?.cover_url ? "url" : "color"
  );
  const [selectedCoverUrl, setSelectedCoverUrl] = useState(initialData?.cover_url || "");
  const [selectedCoverColor, setSelectedCoverColor] = useState(
    initialData?.cover_color || SPINE_PALETTE[0].hex
  );

  // Cover search state
  const [searchQuery, setSearchQuery] = useState("");
  const [hasInitializedSearch, setHasInitializedSearch] = useState(false);
  const [isSearchingCover, setIsSearchingCover] = useState(false);
  const [searchResults, setSearchResults] = useState(null); // null = haven't searched yet, [] = empty

  // Errors & submission
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill search input with title/author when focused or opened if user hasn't typed a custom query
  const handleSearchFocus = () => {
    if (!hasInitializedSearch && !searchQuery.trim()) {
      const suggested = [title, author].filter(Boolean).join(" ");
      if (suggested) {
        setSearchQuery(suggested);
        setHasInitializedSearch(true);
      }
    }
  };

  const handleCoverSearch = async (e) => {
    e.preventDefault();
    const query = searchQuery.trim() || [title, author].filter(Boolean).join(" ");
    if (!query) return;

    setIsSearchingCover(true);
    try {
      const res = await apiFetch(`/api/books/cover-search/?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        // Success (200): { "results": [ { "title", "author", "cover_url" } ] }
        // Empty results is a normal case, not an error
        setSearchResults(Array.isArray(data?.results) ? data.results : []);
      } else {
        setSearchResults([]);
      }
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearchingCover(false);
    }
  };

  const handleSelectCoverUrl = (url) => {
    setSelectedCoverUrl(url);
    setSelectedCoverType("url");
  };

  const handleSelectColor = (hex) => {
    setSelectedCoverColor(hex);
    setSelectedCoverType("color");
    setSelectedCoverUrl("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    // Client-side validation
    const errors = {};
    if (!title.trim()) {
      errors.title = "Title is required.";
    }
    if (!author.trim()) {
      errors.author = "Author is required.";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    // Ensure cover_color is always a valid hex string from the curated palette
    const resolvedCoverColor =
      selectedCoverColor ||
      SPINE_PALETTE[(title.trim().charCodeAt(0) || 0) % SPINE_PALETTE.length]?.hex ||
      SPINE_PALETTE[0].hex;

    const payload = {
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(), // Send empty string "" instead of null when left blank
      status: status,
      cover_color: resolvedCoverColor, // ALWAYS a valid hex string, never null, never omitted
    };

    // If a cover URL was selected, attach it
    if (selectedCoverType === "url" && selectedCoverUrl.trim()) {
      payload.cover_url = selectedCoverUrl.trim();
    } else if (isEdit && initialData?.cover_url) {
      payload.cover_url = null;
    }

    // Optional numeric & date fields: omit the key entirely when blank rather than sending explicit null
    if (pageCount.trim()) {
      const parsed = parseInt(pageCount.trim(), 10);
      if (!isNaN(parsed)) {
        payload.page_count = parsed;
      }
    } else if (isEdit && initialData?.page_count !== null && initialData?.page_count !== undefined) {
      payload.page_count = null;
    }

    if (rating !== null && rating !== undefined && rating !== "") {
      const parsedRating = parseInt(rating, 10);
      if (!isNaN(parsedRating)) {
        payload.rating = parsedRating;
      }
    } else if (isEdit && initialData?.rating !== null && initialData?.rating !== undefined) {
      payload.rating = null;
    }

    if (dateStarted) {
      payload.date_started = dateStarted;
    } else if (isEdit && initialData?.date_started) {
      payload.date_started = null;
    }

    if (dateFinished) {
      payload.date_finished = dateFinished;
    } else if (isEdit && initialData?.date_finished) {
      payload.date_finished = null;
    }

    try {
      const endpoint = isEdit ? `/api/books/${bookId}/` : "/api/books/";
      const method = isEdit ? "PATCH" : "POST";

      const res = await apiFetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        router.push("/dashboard");
        return;
      }

      const data = await res.json().catch(() => null);
      if (res.status === 400 && data) {
        const serverErrors = {};
        Object.entries(data).forEach(([key, val]) => {
          serverErrors[key] = Array.isArray(val) ? val.join(" ") : String(val);
        });
        setFieldErrors(serverErrors);
      } else {
        setGeneralError(data?.detail || "Unable to save book. Please check your inputs.");
      }
    } catch {
      setGeneralError("Network error. Please verify your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8 max-w-2xl w-full min-w-0">
      {/* General error message */}
      {generalError && (
        <div
          role="alert"
          className="p-3.5 rounded-md bg-primary/20 border border-primary/50 text-foreground text-sm flex items-start gap-3"
        >
          <svg
            className="w-5 h-5 text-secondary shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
            />
          </svg>
          <p className="font-sans leading-snug break-words">{generalError}</p>
        </div>
      )}

      {/* Section 1: Book Essentials */}
      <div className="space-y-5">
        <h3 className="font-serif text-lg sm:text-xl font-normal text-foreground tracking-tight border-b border-foreground/10 pb-2 break-words">
          Volume Details
        </h3>

        {/* Title */}
        <div>
          <div className="flex items-baseline justify-between mb-1.5 flex-wrap gap-1">
            <label
              htmlFor="title"
              className="block text-xs sm:text-sm font-sans font-medium text-foreground/80 tracking-wide uppercase"
            >
              Title <span className="text-secondary">*</span>
            </label>
            {fieldErrors.title && (
              <span role="alert" className="text-xs font-sans text-secondary font-medium">
                {fieldErrors.title}
              </span>
            )}
          </div>
          <input
            id="title"
            name="title"
            type="text"
            required
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (fieldErrors.title) {
                setFieldErrors((prev) => ({ ...prev, title: undefined }));
              }
            }}
            placeholder="e.g. Middlemarch"
            className={`w-full min-w-0 rounded-md px-3.5 py-2.5 text-sm sm:text-base font-sans bg-card/[0.04] text-foreground placeholder:text-foreground/35 border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 ${
              fieldErrors.title
                ? "border-primary focus-visible:ring-primary/60"
                : "border-foreground/15 hover:border-foreground/30 focus-visible:border-secondary/60 focus-visible:ring-secondary/40"
            }`}
          />
        </div>

        {/* Author */}
        <div>
          <div className="flex items-baseline justify-between mb-1.5 flex-wrap gap-1">
            <label
              htmlFor="author"
              className="block text-xs sm:text-sm font-sans font-medium text-foreground/80 tracking-wide uppercase"
            >
              Author <span className="text-secondary">*</span>
            </label>
            {fieldErrors.author && (
              <span role="alert" className="text-xs font-sans text-secondary font-medium">
                {fieldErrors.author}
              </span>
            )}
          </div>
          <input
            id="author"
            name="author"
            type="text"
            required
            value={author}
            onChange={(e) => {
              setAuthor(e.target.value);
              if (fieldErrors.author) {
                setFieldErrors((prev) => ({ ...prev, author: undefined }));
              }
            }}
            placeholder="e.g. George Eliot"
            className={`w-full min-w-0 rounded-md px-3.5 py-2.5 text-sm sm:text-base font-sans bg-card/[0.04] text-foreground placeholder:text-foreground/35 border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 ${
              fieldErrors.author
                ? "border-primary focus-visible:ring-primary/60"
                : "border-foreground/15 hover:border-foreground/30 focus-visible:border-secondary/60 focus-visible:ring-secondary/40"
            }`}
          />
        </div>

        {/* Genre & Page Count (2-column on desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Genre */}
          <div>
            <label
              htmlFor="genre"
              className="block text-xs sm:text-sm font-sans font-medium text-foreground/80 tracking-wide uppercase mb-1.5"
            >
              Genre
            </label>
            <input
              id="genre"
              name="genre"
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              placeholder="e.g. Victorian Fiction"
              className="w-full min-w-0 rounded-md px-3.5 py-2.5 text-sm sm:text-base font-sans bg-card/[0.04] text-foreground placeholder:text-foreground/35 border border-foreground/15 hover:border-foreground/30 focus-visible:border-secondary/60 focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:outline-none transition-all duration-150"
            />
          </div>

          {/* Page Count */}
          <div>
            <label
              htmlFor="pageCount"
              className="block text-xs sm:text-sm font-sans font-medium text-foreground/80 tracking-wide uppercase mb-1.5"
            >
              Page Count
            </label>
            <input
              id="pageCount"
              name="pageCount"
              type="number"
              min="1"
              value={pageCount}
              onChange={(e) => setPageCount(e.target.value)}
              placeholder="e.g. 838"
              className="w-full min-w-0 rounded-md px-3.5 py-2.5 text-sm sm:text-base font-sans bg-card/[0.04] text-foreground placeholder:text-foreground/35 border border-foreground/15 hover:border-foreground/30 focus-visible:border-secondary/60 focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:outline-none transition-all duration-150"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Shelf Status & Dates */}
      <div className="space-y-5">
        <h3 className="font-serif text-lg sm:text-xl font-normal text-foreground tracking-tight border-b border-foreground/10 pb-2 break-words">
          Shelf Status &amp; Timeline
        </h3>

        {/* Status */}
        <div>
          <label
            htmlFor="status"
            className="block text-xs sm:text-sm font-sans font-medium text-foreground/80 tracking-wide uppercase mb-1.5"
          >
            Shelf Status
          </label>
          <select
            id="status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full min-w-0 rounded-md px-3.5 py-2.5 text-sm sm:text-base font-sans bg-background text-foreground border border-foreground/15 hover:border-foreground/30 focus-visible:border-secondary/60 focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:outline-none transition-all duration-150"
          >
            <option value="want_to_read">Want to Read</option>
            <option value="reading">Reading</option>
            <option value="read">Read</option>
          </select>
        </div>

        {/* Rating (1-5 simple selector) */}
        <div>
          <div className="flex items-baseline justify-between mb-1.5 flex-wrap gap-1">
            <span className="block text-xs sm:text-sm font-sans font-medium text-foreground/80 tracking-wide uppercase">
              Rating
            </span>
            {rating && (
              <button
                type="button"
                onClick={() => setRating(null)}
                className="text-[11px] font-sans text-foreground/50 hover:text-foreground underline"
              >
                Clear
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = rating !== null && star <= rating;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(rating === star ? null : star)}
                  aria-label={`Rate ${star} out of 5 stars`}
                  className={`p-1.5 rounded transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 active:scale-[0.95] ${
                    isFilled ? "text-secondary" : "text-foreground/25 hover:text-foreground/50"
                  }`}
                >
                  <svg
                    className="w-6 h-6 fill-current"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                  </svg>
                </button>
              );
            })}
            <span className="ml-2 text-xs font-sans text-foreground/50 shrink-0">
              {rating ? `${rating} / 5` : "Unrated"}
            </span>
          </div>
        </div>

        {/* Date started / Date finished */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <label
              htmlFor="dateStarted"
              className="block text-xs sm:text-sm font-sans font-medium text-foreground/80 tracking-wide uppercase mb-1.5"
            >
              Date Started
            </label>
            <input
              id="dateStarted"
              name="dateStarted"
              type="date"
              value={dateStarted}
              onChange={(e) => setDateStarted(e.target.value)}
              className="w-full min-w-0 rounded-md px-3.5 py-2.5 text-sm sm:text-base font-sans bg-card/[0.04] text-foreground border border-foreground/15 hover:border-foreground/30 focus-visible:border-secondary/60 focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:outline-none transition-all duration-150 [color-scheme:dark]"
            />
          </div>

          <div>
            <label
              htmlFor="dateFinished"
              className="block text-xs sm:text-sm font-sans font-medium text-foreground/80 tracking-wide uppercase mb-1.5"
            >
              Date Finished
            </label>
            <input
              id="dateFinished"
              name="dateFinished"
              type="date"
              value={dateFinished}
              onChange={(e) => setDateFinished(e.target.value)}
              className="w-full min-w-0 rounded-md px-3.5 py-2.5 text-sm sm:text-base font-sans bg-card/[0.04] text-foreground border border-foreground/15 hover:border-foreground/30 focus-visible:border-secondary/60 focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:outline-none transition-all duration-150 [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* Section 3: Book Cover & Spine Color */}
      <div className="space-y-5">
        <h3 className="font-serif text-lg sm:text-xl font-normal text-foreground tracking-tight border-b border-foreground/10 pb-2 break-words">
          Cover &amp; Spine
        </h3>

        {/* Search for a cover */}
        <div>
          <label
            htmlFor="coverSearchInput"
            className="block text-xs sm:text-sm font-sans font-medium text-foreground/80 tracking-wide uppercase mb-1.5"
          >
            Search for a cover
          </label>
          <div className="flex gap-2 sm:gap-2.5 min-w-0">
            <input
              id="coverSearchInput"
              type="text"
              value={searchQuery}
              onFocus={handleSearchFocus}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title and author..."
              className="flex-1 min-w-0 rounded-md px-3.5 py-2.5 text-sm sm:text-base font-sans bg-card/[0.04] text-foreground placeholder:text-foreground/35 border border-foreground/15 hover:border-foreground/30 focus-visible:border-secondary/60 focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:outline-none transition-all duration-150"
            />
            <button
              type="button"
              onClick={handleCoverSearch}
              disabled={isSearchingCover}
              className="shrink-0 inline-flex items-center justify-center rounded-md bg-card/[0.08] hover:bg-card/[0.14] px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-sans font-medium text-foreground border border-foreground/15 transition-all duration-150 disabled:opacity-60 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
            >
              {isSearchingCover ? "Searching..." : "Search"}
            </button>
          </div>

          {/* Search results row (if search executed) */}
          {searchResults !== null && (
            <div className="mt-4 pt-3 border-t border-foreground/10">
              {searchResults.length === 0 ? (
                <p className="text-xs font-sans text-foreground/50 italic break-words">
                  No online cover found. Choose a curated spine color below instead.
                </p>
              ) : (
                <div>
                  <p className="text-xs font-sans text-foreground/60 mb-2.5">
                    Click a cover to select it:
                  </p>
                  <div className="flex items-start gap-3.5 overflow-x-auto pb-3 pt-1 max-w-full">
                    {searchResults.map((result, idx) => {
                      const isSelected =
                        selectedCoverType === "url" && selectedCoverUrl === result.cover_url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectCoverUrl(result.cover_url)}
                          className={`group text-left shrink-0 p-1.5 rounded-md border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 ${
                            isSelected
                              ? "border-secondary bg-card/[0.08] ring-2 ring-secondary/50"
                              : "border-foreground/15 bg-card/[0.02] hover:border-foreground/30"
                          }`}
                        >
                          <div className="w-20 h-28 rounded overflow-hidden bg-foreground/10 flex items-center justify-center relative shadow-xs">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={result.cover_url}
                              alt={result.title || "Cover thumbnail"}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center">
                                <span className="w-5 h-5 rounded-full bg-secondary text-background flex items-center justify-center text-xs font-bold">
                                  ✓
                                </span>
                              </div>
                            )}
                          </div>
                          <p className="mt-1.5 text-[11px] font-serif text-foreground line-clamp-1 max-w-[5rem]">
                            {result.title}
                          </p>
                          <p className="text-[10px] font-sans text-foreground/50 line-clamp-1 max-w-[5rem]">
                            {result.author}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Choose a spine color instead */}
        <div className="pt-3 border-t border-foreground/10">
          <label className="block text-xs sm:text-sm font-sans font-medium text-foreground/80 tracking-wide uppercase mb-2">
            Choose a spine color instead
          </label>
          <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
            {SPINE_PALETTE.map((swatch) => {
              const isSelected =
                selectedCoverType === "color" && selectedCoverColor === swatch.hex;
              return (
                <button
                  key={swatch.id}
                  type="button"
                  onClick={() => handleSelectColor(swatch.hex)}
                  aria-label={`Select ${swatch.name} spine`}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-md ${swatch.bgClass} transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 active:scale-[0.95] relative flex items-center justify-center border border-foreground/15 shadow-xs shrink-0 ${
                    isSelected
                      ? "ring-2 ring-secondary ring-offset-2 ring-offset-background scale-105"
                      : "hover:scale-105 opacity-85 hover:opacity-100"
                  }`}
                >
                  {isSelected && (
                    <span className="text-card text-xs font-bold drop-shadow">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-xs font-sans text-foreground/45 font-light break-words">
            {selectedCoverType === "url"
              ? "Cover artwork selected. Click a swatch above to use a solid spine color instead."
              : `Selected spine: ${
                  SPINE_PALETTE.find((s) => s.hex === selectedCoverColor)?.name || "Custom"
                }.`}
          </p>
        </div>
      </div>

      {/* Submission Actions */}
      <div className="pt-6 border-t border-foreground/10 flex items-center justify-between flex-wrap gap-3 sm:gap-4">
        <Link
          href="/dashboard"
          className="text-xs sm:text-sm font-sans text-foreground/70 hover:text-foreground transition-colors px-3 py-2 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 shrink-0"
        >
          &larr; Cancel
        </Link>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center rounded-md bg-primary px-5 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-sans font-medium text-card hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 shrink-0"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-card"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              {isEdit ? "Saving changes..." : "Adding to shelf..."}
            </span>
          ) : isEdit ? (
            "Save Changes"
          ) : (
            "Add Volume"
          )}
        </button>
      </div>
    </form>
  );
}
