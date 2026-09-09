"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setTokens } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      setErrorMessage("Please enter both your username and password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/auth/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: trimmedUsername,
          password: password,
        }),
      });

      const data = await res.json().catch(() => null);

      // EXACT API CONTRACT:
      // Success (200): { "access": "string", "refresh": "string" }
      if (res.status === 200 && data?.access && data?.refresh) {
        setTokens(data.access, data.refresh);
        router.push("/dashboard");
        return;
      }

      // Error (401) — generic, NOT field-keyed:
      // { "detail": "No active account found with the given credentials" }
      if (res.status === 401 || data?.detail) {
        setErrorMessage(
          data?.detail || "No active account found with the given credentials."
        );
      } else {
        setErrorMessage(
          "Unable to sign in. Please check your credentials and try again."
        );
      }
    } catch (err) {
      setErrorMessage(
        "Unable to connect to the server. Please check your network connection."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col justify-between bg-background text-foreground selection:bg-secondary/30 selection:text-foreground">
      {/* Top minimal header */}
      <header className="w-full">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 rounded"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-placeholder.png"
              alt="Marginalia"
              className="h-9 w-auto object-contain"
            />
          </Link>

          <Link
            href="/signup"
            className="text-sm font-sans text-foreground/80 hover:text-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 rounded px-1 py-0.5"
          >
            Create an account
          </Link>
        </div>
      </header>

      {/* Main re-entry card container */}
      <main className="flex-1 flex items-center justify-center px-6 sm:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Card container */}
          <div className="rounded-lg border border-foreground/10 bg-card/[0.03] p-7 sm:p-9 shadow-sm backdrop-blur-xs">
            {/* Heading & Subtitle */}
            <div className="mb-7">
              <h1 className="font-serif text-2xl sm:text-3xl font-normal text-foreground tracking-tight">
                Return to your shelf
              </h1>
              <p className="mt-2 text-sm font-sans font-light text-foreground/70 leading-relaxed">
                Enter your credentials to reopen your reading ledger, notes, and
                marginalia.
              </p>
            </div>

            {/* General form-level error message */}
            {errorMessage && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-6 p-3.5 rounded-md bg-primary/20 border border-primary/50 text-foreground text-sm flex items-start gap-3"
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
                <p className="font-sans leading-snug">{errorMessage}</p>
              </div>
            )}

            {/* Login form */}
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Username Field */}
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs sm:text-sm font-sans font-medium text-foreground/80 tracking-wide uppercase mb-1.5"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (errorMessage) setErrorMessage("");
                  }}
                  placeholder="e.g. zainab_abba"
                  className="w-full rounded-md px-3.5 py-3 text-sm sm:text-base font-sans bg-card/[0.04] text-foreground placeholder:text-foreground/35 border border-foreground/15 hover:border-foreground/30 focus-visible:border-secondary/60 focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:outline-none transition-all duration-150"
                />
              </div>

              {/* Password Field */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs sm:text-sm font-sans font-medium text-foreground/80 tracking-wide uppercase mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage("");
                    }}
                    placeholder="••••••••"
                    className="w-full rounded-md pl-3.5 pr-11 py-3 text-sm sm:text-base font-sans bg-card/[0.04] text-foreground placeholder:text-foreground/35 border border-foreground/15 hover:border-foreground/30 focus-visible:border-secondary/60 focus-visible:ring-2 focus-visible:ring-secondary/40 focus-visible:outline-none transition-all duration-150"
                  />

                  {/* Show/Hide password toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-foreground/50 hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 rounded"
                  >
                    {showPassword ? (
                      /* Eye Slash Icon */
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
                          d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                        />
                      </svg>
                    ) : (
                      /* Eye Icon */
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
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center rounded-md bg-primary px-6 py-3.5 text-sm sm:text-base font-sans font-medium text-card hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98] transition-all duration-150 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
                >
                  {isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      {/* Loading spinner */}
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
                      Opening your shelf...
                    </span>
                  ) : (
                    "Sign in to your shelf"
                  )}
                </button>
              </div>
            </form>

            {/* Bottom link to signup */}
            <div className="mt-6 pt-5 border-t border-foreground/10 text-center">
              <p className="text-xs sm:text-sm font-sans text-foreground/70 font-light">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-secondary font-medium hover:text-secondary/80 underline underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 rounded px-1"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Discrete footer */}
      <footer className="w-full border-t border-foreground/10 py-6 text-center text-xs font-sans text-foreground/40 font-light">
        &copy; 2026 Marginalia &middot; A thoughtful reading journal
      </footer>
    </div>
  );
}
