import Link from "next/link";
import BookForm from "@/components/BookForm";

export const metadata = {
  title: "Add a Book — Marginalia",
  description: "Record a new volume into your reading ledger.",
};

export default function NewBookPage() {
  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-6 sm:px-8 py-10 sm:py-14">
      {/* Top back navigation */}
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-sans text-foreground/60 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 rounded px-1 py-0.5"
        >
          &larr; Back to shelf
        </Link>
      </div>

      {/* Page Header */}
      <div className="mb-8 sm:mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-normal tracking-tight">
          Add a volume
        </h1>
        <p className="mt-2 text-sm sm:text-base font-sans font-light text-foreground/70 leading-relaxed max-w-xl">
          Enter title and author to begin, search for cover artwork, or pick a
          curated spine color for your shelf.
        </p>
      </div>

      {/* Form Container */}
      <div className="rounded-lg border border-foreground/10 bg-card/[0.02] p-6 sm:p-10">
        <BookForm />
      </div>
    </div>
  );
}
