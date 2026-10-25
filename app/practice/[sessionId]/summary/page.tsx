"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";

import { getPracticeSession } from "../../../../lib/api";
import { formatTimer } from "../../../../lib/practiceStore";
import { PinMeHeader } from "../../../components/PinMeHeader";
import { RequireAuth } from "../../../components/RequireAuth";

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
      <PinMeHeader />
      <RequireAuth>
      <main className="relative mx-auto w-full max-w-xl px-6 pb-20 sm:px-10">
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">
          Practice done
        </h1>
        <p className="mt-3 text-base text-muted">Session summary</p>

        {sessionQuery.isLoading ? (
          <p className="mt-8 text-sm text-muted">Loading…</p>
        ) : sessionQuery.isError || !session ? (
          <p className="mt-8 text-sm text-bad" role="alert">
            {(sessionQuery.error as Error)?.message ?? "Session not found"}
          </p>
        ) : (
          <dl className="mt-10 divide-y divide-line border-y border-line">
            <div className="flex justify-between gap-4 py-4">
              <dt className="text-sm text-muted">Completed</dt>
              <dd className="text-lg tabular-nums text-ok">
                {session.completed_count}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-4">
              <dt className="text-sm text-muted">Skipped</dt>
              <dd className="text-lg tabular-nums text-foreground">
                {session.skipped_count}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-4">
              <dt className="text-sm text-muted">Practice time</dt>
              <dd className="text-lg tabular-nums">
                {formatTimer(session.total_practice_seconds)}
              </dd>
            </div>
            <div className="flex justify-between gap-4 py-4">
              <dt className="text-sm text-muted">Queue size</dt>
              <dd className="text-lg tabular-nums">{session.image_count}</dd>
            </div>
          </dl>
        )}

        {session ? (
          <Link
            href={`/boards/${session.board_id}`}
            className="mt-10 inline-flex min-h-12 items-center bg-accent px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Back to board
          </Link>
        ) : (
          <Link
            href="/boards"
            className="mt-10 inline-flex min-h-11 items-center text-sm text-muted transition-colors hover:text-foreground"
          >
            ← Boards
          </Link>
        )}
      </main>
      </RequireAuth>
    </div>
  );
}
