"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
        // Handled silently; ProtectedLayout handles auth redirection if token invalid
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchUser();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex-1 max-w-6xl w-full mx-auto px-6 sm:px-8 py-10 sm:py-16">
      {/* Header section with warm personalized greeting */}
      <section className="max-w-3xl">
        {isLoading ? (
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

      {/* Quiet, intentional placeholder for The Shelf (to be built next) */}
      <section className="mt-12 sm:mt-16 pt-8 border-t border-foreground/10">
        <div className="rounded-lg border border-foreground/10 bg-card/[0.02] p-8 sm:p-12 text-center max-w-2xl mx-auto">
          {/* Subtle bookplate icon mark */}
          <div className="w-10 h-10 rounded-full border border-foreground/15 bg-card/[0.04] flex items-center justify-center mx-auto mb-4 text-secondary">
            <svg
              className="w-5 h-5"
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

          <h2 className="font-serif text-xl sm:text-2xl font-normal text-foreground tracking-tight">
            The Shelf
          </h2>

          <p className="mt-2.5 text-sm sm:text-base font-sans font-light text-foreground/70 max-w-md mx-auto leading-relaxed">
            Your reading ledger will assemble here. Volumes on your nightstand,
            in your hands, and finished pages will have their dedicated space.
          </p>
        </div>
      </section>
    </div>
  );
}
