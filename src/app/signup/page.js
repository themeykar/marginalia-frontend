"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PULL_QUOTES = [
  {
    quote:
      "A book unrecorded is a landscape walked in twilight — vivid while you tread it, quiet the moment you turn away.",
    context: "On memory and the written shelf",
  },
  {
    quote:
      "Every finished volume is an anchor dropped in who you were the night you turned the final page.",
    context: "On the passage of reading time",
  },
  {
    quote:
      "We do not read to escape the world, but to gather the sentences that will explain it when we return.",
    context: "On keeping lines that matter",
  },
];

export default function SignupPage() {
  const router = useRouter();

  // Form fields
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // States
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeQuoteIndex, setActiveQuoteIndex] = useState(0);

  // Client-side validation before API submission
  const validateForm = () => {
    const errors = {};

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      errors.username = "Username is required.";
    } else if (trimmedUsername.length < 3) {
      errors.username = "Username must be at least 3 characters.";
    }

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      errors.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Please enter a valid email address.";
    }

    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters.";
    }

    return errors;
  };

  const handleFieldChange = (field, setter) => (e) => {
    setter(e.target.value);
    // Clear the specific field error when user types
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (generalError) {
      setGeneralError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    const clientErrors = validateForm();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }

    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const res = await fetch(`${apiUrl}/api/auth/signup/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password: password,
        }),
      });

      // EXACT API CONTRACT:
      // Success (201): { "id": 1, "username": "string", "email": "string" }
      // Signup does NOT return tokens and does NOT log user in.
      // Redirect to /login
      if (res.status === 201) {
        router.push("/login");
        return;
      }

      // Error (400) — DRF field-keyed validation errors:
      // e.g. { "username": ["A user with that username already exists."] }
      const data = await res.json().catch(() => null);

      if (res.status === 400 && data) {
        const serverFieldErrors = {};
        let topError = "";

        Object.entries(data).forEach(([key, val]) => {
          const message = Array.isArray(val) ? val.join(" ") : String(val);
          if (key === "username" || key === "email" || key === "password") {
            serverFieldErrors[key] = message;
          } else if (key === "non_field_errors" || key === "detail") {
            topError = message;
          } else {
            topError = message;
          }
        });

        setFieldErrors(serverFieldErrors);
        if (topError) {
          setGeneralError(topError);
        }
      } else {
        setGeneralError(
          data?.detail || "Unable to create account. Please try again."
        );
      }
    } catch (err) {
      setGeneralError(
        "Unable to connect to the server. Please check your connection."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-secondary/30 selection:text-foreground">
      {/* Split-screen container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[100dvh]">
        {/* Editorial / Atmospheric Panel (Left side on desktop, bottom on mobile) */}
        <aside className="order-2 lg:order-1 lg:col-span-5 bg-card/[0.02] border-t lg:border-t-0 lg:border-r border-foreground/10 p-6 sm:p-10 lg:p-14 flex flex-col justify-between relative overflow-hidden">
          {/* Subtle background ambient glow */}
          <div
            className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-secondary/[0.03] blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div
            className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-primary/[0.06] blur-3xl pointer-events-none"
            aria-hidden="true"
          />

          {/* Top Brand Header */}
          <div className="relative z-10">
            <Link
              href="/"
              className="inline-flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 rounded"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-placeholder.png"
                alt="Marginalia"
                className="h-8 sm:h-9 w-auto object-contain transition-opacity group-hover:opacity-90"
              />
              <span className="font-serif italic text-foreground/50 text-xs sm:text-sm tracking-wider uppercase">
                Reading Journal
              </span>
            </Link>
          </div>

          {/* Center Editorial Passage */}
          <div className="my-10 lg:my-auto relative z-10 max-w-md">
            {/* Bookplate motif / rubric */}
            <div className="inline-flex items-center gap-2 mb-6 px-2.5 py-1 rounded border border-foreground/10 bg-card/[0.03] text-[11px] font-sans tracking-widest uppercase text-foreground/60">
              <span className="w-1.5 h-1.5 rounded-full bg-status-reading" />
              <span>Ex Libris · The First Entry</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-normal text-foreground leading-snug tracking-tight">
              A quiet sanctuary for the pages that shape you.
            </h2>

            <p className="mt-5 font-sans font-light text-foreground/75 text-sm sm:text-base leading-relaxed">
              To keep a reading journal is to refuse the hurried blur of finished
              books. Here, your shelves remain unhurried: a personal archive to
              hold the passages that stopped your breath, the ideas that
              lingered, and the quiet notes you scribbled in the margin before
              turning the light out.
            </p>

            {/* Literary Pull Quotes Card */}
            <div className="mt-8 pt-6 border-t border-foreground/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-sans text-foreground/50 tracking-wider uppercase">
                  {PULL_QUOTES[activeQuoteIndex].context}
                </span>
                <div className="flex items-center gap-1.5" role="tablist" aria-label="Quote selection">
                  {PULL_QUOTES.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      role="tab"
                      aria-selected={activeQuoteIndex === i}
                      aria-label={`Show quote ${i + 1}`}
                      onClick={() => setActiveQuoteIndex(i)}
                      className={`h-1.5 rounded-full transition-all duration-200 ${activeQuoteIndex === i
                          ? "w-6 bg-secondary"
                          : "w-2 bg-foreground/20 hover:bg-foreground/40"
                        }`}
                    />
                  ))}
                </div>
              </div>

              <blockquote className="min-h-[5.5rem] flex flex-col justify-center">
                <p className="font-serif italic text-foreground/85 text-base sm:text-lg leading-relaxed pl-3.5 border-l-2 border-secondary/50">
                  &ldquo;{PULL_QUOTES[activeQuoteIndex].quote}&rdquo;
                </p>
              </blockquote>
            </div>
          </div>

          {/* Bottom Atmospheric Shelf Vignette */}
          <div className="pt-6 border-t border-foreground/10 relative z-10 flex items-center justify-between text-xs text-foreground/50 font-sans font-light">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2.5 h-2.5 rounded-xs bg-primary/80" />
              <span className="inline-block w-2.5 h-2.5 rounded-xs bg-secondary/80" />
              <span className="inline-block w-2.5 h-2.5 rounded-xs bg-status-reading/80" />
              <span className="ml-1 text-foreground/60">Private &amp; deliberate</span>
            </div>
            <span>No algorithms, no noise</span>
          </div>
        </aside>

        {/* Signup Form Panel (Right side on desktop, top on mobile) */}
        <main className="order-1 lg:order-2 lg:col-span-7 flex flex-col justify-between p-6 sm:p-10 lg:p-14 xl:p-16">
          {/* Top navigation / login switch */}
          <div className="flex justify-end items-center mb-8 sm:mb-12">
            <span className="text-sm font-sans text-foreground/70 mr-2">
              Already have a shelf?
            </span>
            <Link
              href="/login"
              className="text-sm font-sans font-medium text-secondary hover:text-secondary/80 underline underline-offset-4 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 rounded px-1"
            >
              Sign In &rarr;
            </Link>
          </div>

          {/* Form Content Area */}
          <div className="max-w-md w-full mx-auto my-auto py-4">
            <div className="mb-8">
              <h1 className="font-serif text-3xl sm:text-4xl text-foreground font-normal tracking-tight">
                Open your ledger
              </h1>
              <p className="mt-2.5 text-sm sm:text-base font-sans font-light text-foreground/75 leading-relaxed">
                Create your reader account to begin logging volumes, holding
                marginal notes, and keeping quotes that linger.
              </p>
            </div>

            {/* General Error Banner (non-field or network errors) */}
            {generalError && (
              <div
                role="alert"
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
                <p className="font-sans leading-snug">{generalError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Username Field */}
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <label
                    htmlFor="username"
                    className="block text-xs sm:text-sm font-sans font-medium text-foreground/80 tracking-wide uppercase"
                  >
                    Username
                  </label>
                  {fieldErrors.username && (
                    <span
                      id="username-error"
                      role="alert"
                      className="text-xs font-sans text-secondary font-medium"
                    >
                      {fieldErrors.username}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={username}
                    onChange={handleFieldChange("username", setUsername)}
                    aria-invalid={Boolean(fieldErrors.username)}
                    aria-describedby={
                      fieldErrors.username ? "username-error" : "username-hint"
                    }
                    placeholder="e.g. zainab_abba"
                    className={`w-full rounded-md px-3.5 py-3 text-sm sm:text-base font-sans bg-card/[0.04] text-foreground placeholder:text-foreground/35 border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 ${fieldErrors.username
                        ? "border-primary focus-visible:ring-primary/60"
                        : "border-foreground/15 hover:border-foreground/30 focus-visible:border-secondary/60 focus-visible:ring-secondary/40"
                      }`}
                  />
                </div>
                <p
                  id="username-hint"
                  className="mt-1.5 text-xs font-sans text-foreground/50 font-light"
                >
                  Your unique reader handle on Marginalia.
                </p>
              </div>

              {/* Email Field */}
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <label
                    htmlFor="email"
                    className="block text-xs sm:text-sm font-sans font-medium text-foreground/80 tracking-wide uppercase"
                  >
                    Email address
                  </label>
                  {fieldErrors.email && (
                    <span
                      id="email-error"
                      role="alert"
                      className="text-xs font-sans text-secondary font-medium"
                    >
                      {fieldErrors.email}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={handleFieldChange("email", setEmail)}
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={
                      fieldErrors.email ? "email-error" : undefined
                    }
                    placeholder="reader@example.com"
                    className={`w-full rounded-md px-3.5 py-3 text-sm sm:text-base font-sans bg-card/[0.04] text-foreground placeholder:text-foreground/35 border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 ${fieldErrors.email
                        ? "border-primary focus-visible:ring-primary/60"
                        : "border-foreground/15 hover:border-foreground/30 focus-visible:border-secondary/60 focus-visible:ring-secondary/40"
                      }`}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-baseline justify-between mb-1.5">
                  <label
                    htmlFor="password"
                    className="block text-xs sm:text-sm font-sans font-medium text-foreground/80 tracking-wide uppercase"
                  >
                    Password
                  </label>
                  {fieldErrors.password && (
                    <span
                      id="password-error"
                      role="alert"
                      className="text-xs font-sans text-secondary font-medium"
                    >
                      {fieldErrors.password}
                    </span>
                  )}
                </div>

                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={handleFieldChange("password", setPassword)}
                    aria-invalid={Boolean(fieldErrors.password)}
                    aria-describedby="password-rules"
                    placeholder="••••••••"
                    className={`w-full rounded-md pl-3.5 pr-11 py-3 text-sm sm:text-base font-sans bg-card/[0.04] text-foreground placeholder:text-foreground/35 border transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 ${fieldErrors.password
                        ? "border-primary focus-visible:ring-primary/60"
                        : "border-foreground/15 hover:border-foreground/30 focus-visible:border-secondary/60 focus-visible:ring-secondary/40"
                      }`}
                  />

                  {/* Show/Hide password toggle button */}
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

                {/* Inline rule shown before server error */}
                <div
                  id="password-rules"
                  className="mt-1.5 flex items-center gap-1.5 text-xs font-sans font-light"
                >
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full transition-colors ${password.length >= 8
                        ? "bg-status-reading"
                        : "bg-foreground/30"
                      }`}
                  />
                  <span
                    className={
                      password.length >= 8
                        ? "text-foreground/80"
                        : "text-foreground/50"
                    }
                  >
                    Must be at least 8 characters long
                  </span>
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
                    "Create your shelf"
                  )}
                </button>
              </div>
            </form>

            {/* Bottom terms / reassurance */}
            <p className="mt-6 text-center text-xs font-sans text-foreground/45 leading-relaxed font-light">
              By creating an account, you start a private shelf. Your reading
              data is yours alone and never sold or shared.
            </p>
          </div>

          {/* Footer note in form column */}
          <div className="text-center pt-8 border-t border-foreground/10 text-xs font-sans text-foreground/40 font-light">
            &copy; 2026 Marginalia &middot; A thoughtful reading journal
          </div>
        </main>
      </div>
    </div>
  );
}
