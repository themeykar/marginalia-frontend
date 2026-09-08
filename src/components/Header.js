import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 h-20 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 rounded"
        >
          {/* Plain img tag as specified in brief - ~32-40px height, auto width */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-placeholder.png"
            alt="Marginalia"
            className="h-9 w-auto object-contain"
          />
        </Link>

        <nav className="flex items-center gap-6 sm:gap-8">
          <Link
            href="/login"
            className="text-sm font-sans text-foreground/80 hover:text-foreground transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60 rounded px-1 py-0.5"
          >
            Log In
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-sans font-medium text-card hover:bg-primary/90 active:scale-[0.97] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/60"
          >
            Sign Up
          </Link>
        </nav>
      </div>
    </header>
  );
}
