"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import BookForm from "@/components/BookForm";

export default function EditBookPage() {
  const params = useParams();
  const id = params?.id;

  const [book, setBook] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function fetchBook() {
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
            setError("Unable to find this volume in your ledger.");
          }
        }
      } catch {
        if (isMounted) {
          setError("Network error while loading volume details.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchBook();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex-1 max-w-4xl w-full mx-auto px-6 sm:px-8 py-10 sm:py-14">
        <div className="animate-pulse space-y-4 max-w-xl">
          <div className="h-4 w-28 bg-foreground/10 rounded" />
          <div className="h-10 w-64 bg-foreground/10 rounded" />
          <div className="h-4 w-96 bg-foreground/10 rounded" />
          <div className="h-72 w-full bg-card/[0.02] border border-foreground/10 rounded-lg mt-8" />
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="flex-1 max-w-4xl w-full mx-auto px-6 sm:px-8 py-10 sm:py-14">
        <div className="rounded-lg border border-foreground/10 bg-card/[0.02] p-8 text-center max-w-md mx-auto">
          <h1 className="font-serif text-2xl text-foreground font-normal mb-2">
            Volume Not Found
          </h1>
          <p className="text-sm font-sans text-foreground/60 mb-6">
            {error || "The volume you requested could not be loaded."}
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
          Edit volume
        </h1>
        <p className="mt-2 text-sm sm:text-base font-sans font-light text-foreground/70 leading-relaxed max-w-xl">
          Update the reading status, cover, spine color, or details for &ldquo;
          {book.title}&rdquo;.
        </p>
      </div>

      {/* Form Container */}
      <div className="rounded-lg border border-foreground/10 bg-card/[0.02] p-6 sm:p-10">
        <BookForm initialData={book} bookId={id} isEdit={true} />
      </div>
    </div>
  );
}
