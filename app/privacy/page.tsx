import type { Metadata } from "next";
import Link from "next/link";

import { SiteHeader } from "../components/SiteHeader";

export const metadata: Metadata = {
  title: "Privacy Policy · PinMe",
  description:
    "Privacy policy for PinMe, a personal portfolio drawing-practice application by Gabriel Francke.",
};

export default function PrivacyPage() {
  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(229,9,20,0.1)_0%,_transparent_40%)]"
      />
      <SiteHeader />
      <main className="relative mx-auto w-full max-w-2xl px-6 pb-20 sm:px-10">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          francke.tech · PinMe
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Privacy Policy
        </h1>
        <p className="mt-2 font-mono text-xs text-muted">
          Last updated: 9 October 2026
        </p>

        <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted">
          <section>
            <h2 className="text-base font-semibold text-foreground">
              Who we are
            </h2>
            <p className="mt-2">
              PinMe is a personal portfolio project by Gabriel Francke
              (francke.tech). Contact:{" "}
              <a
                className="text-foreground underline decoration-line underline-offset-4 hover:text-accent"
                href="mailto:g.francke.tech@gmail.com"
              >
                g.francke.tech@gmail.com
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              What PinMe does
            </h2>
            <p className="mt-2">
              PinMe helps users practice drawing with timed sessions built from
              their own reference boards and images. In the future it may
              connect to the authenticated user&apos;s own Pinterest boards and
              Pins (with explicit OAuth consent) only to organize private
              practice material.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              Data we may process
            </h2>
            <ul className="mt-2 list-disc space-y-2 pl-5">
              <li>Account contact details you provide (e.g. email).</li>
              <li>
                Boards, images, and practice progress you create in the app.
              </li>
              <li>
                If you connect Pinterest: only your own boards/Pins that you
                authorize, used to build private practice sessions.
              </li>
              <li>Basic technical logs needed to run and secure the service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              How we use data
            </h2>
            <p className="mt-2">
              Data is used solely to provide PinMe features (boards, practice
              sessions, progress). We do not sell personal data. We do not use
              Pinterest data for advertising.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              Sharing
            </h2>
            <p className="mt-2">
              We may use standard hosting providers (e.g. Vercel, Railway,
              Cloudflare) as processors to run the app. We do not share your
              content with third parties for their marketing.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              Retention &amp; your choices
            </h2>
            <p className="mt-2">
              You can request access, correction, or deletion of your data by
              emailing the contact above. You can disconnect a Pinterest
              authorization at any time via Pinterest and/or the app when that
              feature is available.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground">
              Changes
            </h2>
            <p className="mt-2">
              If this policy changes, we will update the date on this page.
            </p>
          </section>
        </div>

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
