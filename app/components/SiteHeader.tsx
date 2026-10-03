import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-6 sm:px-10">
      <Link href="/" className="text-lg font-semibold tracking-tight text-foreground">
        PinMe
      </Link>
      <nav className="flex items-center gap-6 font-mono text-xs uppercase tracking-[0.16em] text-muted">
        <Link href="/boards" className="transition-colors hover:text-foreground">
          Boards
        </Link>
      </nav>
    </header>
  );
}
