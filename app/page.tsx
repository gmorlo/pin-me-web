import Link from "next/link";

import { ApiHealthStatus } from "./components/ApiHealthStatus";
import { PinMeHeader } from "./components/PinMeHeader";
import { PORTFOLIO_URL } from "../lib/site";

export default function PinMeHomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(229,9,20,0.14)_0%,_transparent_42%),radial-gradient(ellipse_at_bottom,_rgba(255,255,255,0.04)_0%,_transparent_55%)]"
      />
      <PinMeHeader />
      <main className="relative mx-auto flex w-full max-w-3xl flex-col justify-center px-6 pb-16 pt-6 sm:px-10 sm:pt-10">
        <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-7xl">
          PinMe
        </h1>
        <p className="mt-4 max-w-md text-base leading-relaxed text-muted sm:text-lg">
          Timed drawing practice from your own reference boards — Complete,
          Skip, and progress reset without repeats until you choose.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/boards"
            className="inline-flex min-h-11 items-center bg-accent px-5 font-mono text-xs uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-90"
          >
            Open boards
          </Link>
          <a
            href={PORTFOLIO_URL}
            className="inline-flex min-h-11 items-center px-2 font-mono text-xs uppercase tracking-[0.16em] text-muted transition-colors hover:text-foreground"
            rel="noreferrer"
          >
            Back to portfolio
          </a>
        </div>

        <ApiHealthStatus />
      </main>
    </div>
  );
}
