"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

import { getPracticeSession } from "../../../../lib/api";
import { formatTimer } from "../../../../lib/practiceStore";
import { SiteHeader } from "../../../components/SiteHeader";

export default function PracticeSummaryPage() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;

  const sessionQuery = useQuery({
    queryKey: ["practice-session", sessionId],
    queryFn: () => getPracticeSession(sessionId),
  });

  const session = sessionQuery.data;

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(229,9,20,0.12)_0%,_transparent_40%)]"
      />
      <SiteHeader />
      <main className="relative mx-auto w-full max-w-xl px-6 pb-20 sm:px-10">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          Session summary
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight animate-fade-up">
          Practice done
        </h1>

        {sessionQuery.isLoading ? (
          <p className="mt-8 font-mono text-sm text-muted">Loading…</p>
        ) : sessionQuery.isError || !session ? (
          <p className="mt-8 font-mono text-sm text-bad">
            {(sessionQuery.error as Error)?.message ?? "Session not found"}
          </p>
        ) : (
          <dl className="mt-10 space-y-4 border border-line bg-surface/50 px-5 py-6 animate-fade-up">
            <div className="flex justify-between gap-4">
              <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                Completed
              </dt>
              <dd className="font-mono text-lg text-ok">
                {session.completed_count}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                Skipped
              </dt>
              <dd className="font-mono text-lg text-warn">
                {session.skipped_count}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                Practice time
              </dt>
              <dd className="font-mono text-lg">
                {formatTimer(session.total_practice_seconds)}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                Queue size
              </dt>
              <dd className="font-mono text-lg">{session.image_count}</dd>
            </div>
          </dl>
        )}

        {session ? (
          <Link
            href={`/boards/${session.board_id}`}
            className="mt-10 inline-flex bg-accent px-5 py-3 font-mono text-xs uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-90"
          >
            Back to board
          </Link>
        ) : (
          <Link
            href="/boards"
            className="mt-10 inline-flex font-mono text-xs uppercase tracking-[0.16em] text-muted hover:text-foreground"
          >
            ← Boards
          </Link>
        )}
      </main>
    </div>
  );
}
