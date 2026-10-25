import type { Metadata } from "next";
import Link from "next/link";

import { PinMeHeader } from "../components/PinMeHeader";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy information for PinMe.",
};

const PORTFOLIO_PRIVACY =
  process.env.NEXT_PUBLIC_PORTFOLIO_URL != null
    ? `${process.env.NEXT_PUBLIC_PORTFOLIO_URL.replace(/\/$/, "")}/privacy`
    : "https://francke.tech/privacy";

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(229,9,20,0.1)_0%,_transparent_40%)]"
      />
      <PinMeHeader />
      <main className="relative mx-auto w-full max-w-2xl px-6 pb-20 sm:px-10">
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">Privacy</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          PinMe stores the boards, images, and practice progress you create so
          you can run timed drawing sessions. We do not sell your data. For the
          full policy and contact details, see{" "}
          <a
            className="text-foreground underline decoration-line underline-offset-4 hover:text-accent"
            href={PORTFOLIO_PRIVACY}
            rel="noreferrer"
          >
            francke.tech/privacy
          </a>{" "}
          or email{" "}
          <a
            className="text-foreground underline decoration-line underline-offset-4 hover:text-accent"
            href="mailto:contact@francke.tech"
          >
            contact@francke.tech
          </a>
          .
        </p>

        <Link
          href="/"
          className="mt-12 inline-flex font-mono text-xs uppercase tracking-[0.16em] text-muted transition-colors hover:text-foreground"
        >
          ← Back to PinMe
        </Link>
      </main>
    </div>
  );
}
