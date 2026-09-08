export default function Footer() {
  return (
    <footer className="w-full border-t border-foreground/10 bg-black/15">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-12 sm:py-16 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-placeholder.png"
            alt="Marginalia"
            className="h-7 w-auto object-contain opacity-75"
          />
          <p className="mt-3 font-serif italic text-foreground/50 text-sm max-w-sm">
            Where your reading lingers and becomes memory.
          </p>
        </div>

        <p className="text-xs font-sans text-foreground/40 font-light">
          &copy; 2026 Marginalia. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
