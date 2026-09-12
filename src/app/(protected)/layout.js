"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAccessToken, clearTokens } from "@/lib/auth";
import { apiFetch } from "@/lib/api";

export default function ProtectedLayout({ children }) {
  const router = useRouter();
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      const token = getAccessToken();

      // If no token exists at all, redirect to /login immediately without flashing content
      if (!token) {
        router.replace("/login");
        return;
      }

      try {
        // Verify the token by calling /api/auth/me/
        // apiFetch automatically handles 401 token refresh and retry
        const res = await apiFetch("/api/auth/me/");

        if (res.ok) {
          if (isMounted) {
            setIsVerified(true);
          }
        } else {
          // Token verification failed even after refresh attempt
          clearTokens();
          router.replace("/login");
        }
      } catch (err) {
        clearTokens();
        router.replace("/login");
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleLogout = () => {
    clearTokens();
    router.push("/login");
  };

  // While checking auth on mount, display a minimal, serene loading state
  // to completely avoid any flash of protected content
  if (!isVerified) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background text-foreground selection:bg-secondary/30 selection:text-foreground">
        <div className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-placeholder.png"
            alt="Marginalia"
            className="h-8 w-auto object-contain opacity-60 animate-pulse"
          />
          <span className="font-serif italic text-xs text-foreground/45 tracking-wider">
            Opening your shelf...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] w-full max-w-full overflow-x-clip flex flex-col bg-background text-foreground selection:bg-secondary/30 selection:text-foreground">
      {/* Authenticated App Shell Chrome / Top Bar */}
      <header className="w-full border-b border-foreground/10 bg-background/80 backdrop-blur-xs sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 h-18 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 rounded"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-placeholder.png"
                alt="Marginalia"
                className="h-8 sm:h-9 w-auto object-contain transition-opacity group-hover:opacity-90"
              />
              <span className="hidden sm:inline-block font-serif italic text-foreground/40 text-xs tracking-wider uppercase">
                Ledger
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4 sm:gap-6">
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs sm:text-sm font-sans text-foreground/70 hover:text-foreground transition-all duration-150 rounded px-3 py-1.5 border border-foreground/15 hover:border-foreground/30 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-1 flex flex-col min-w-0 w-full">{children}</main>

      {/* Discrete Shell Footer */}
      <footer className="w-full border-t border-foreground/10 py-6 text-center text-xs font-sans text-foreground/40 font-light">
        &copy; 2026 Marginalia &middot; A thoughtful reading journal
      </footer>
    </div>
  );
}
