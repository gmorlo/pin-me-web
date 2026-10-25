"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { RequireAuth } from "../../components/RequireAuth";
import {
  completePracticeImage,
  finishPracticeSession,
  getPracticeSession,
  imageContentUrl,
  pausePracticeSession,
  resumePracticeSession,
  skipPracticeImage,
  type PracticeSession,
} from "../../../lib/api";
import { formatTimer, usePracticeStore } from "../../../lib/practiceStore";

export default function PracticeSessionPage() {
  return (
    <RequireAuth>
      <PracticeSessionInner />
    </RequireAuth>
  );
}

function PracticeSessionInner() {
  const params = useParams<{ sessionId: string }>();
  const sessionId = params.sessionId;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const remainingSeconds = usePracticeStore((s) => s.remainingSeconds);
  const running = usePracticeStore((s) => s.running);
  const hydrate = usePracticeStore((s) => s.hydrate);
  const setRunning = usePracticeStore((s) => s.setRunning);
  const clear = usePracticeStore((s) => s.clear);

  const sessionQuery = useQuery({
    queryKey: ["practice-session", sessionId],
    queryFn: () => getPracticeSession(sessionId),
  });

  const session = sessionQuery.data;

  useEffect(() => {
    if (!session) return;
    if (session.status === "FINISHED" || session.status === "CANCELLED") {
      clear();
      router.replace(`/practice/${sessionId}/summary`);
      return;
    }
    hydrate({
      sessionId: session.id,
      durationSeconds: session.duration_per_image_seconds,
      imageKey: session.current_image?.id ?? null,
      running: session.status === "ACTIVE",
    });
  }, [session, sessionId, hydrate, clear, router]);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      usePracticeStore.getState().tick();
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  async function applySession(next: PracticeSession) {
    await queryClient.setQueryData(["practice-session", sessionId], next);
    if (next.status === "FINISHED" || !next.current_image) {
      clear();
      router.push(`/practice/${sessionId}/summary`);
    }
  }

  const pauseMutation = useMutation({
    mutationFn: () => pausePracticeSession(sessionId),
    onSuccess: async (next) => {
      setError(null);
      setRunning(false);
      await applySession(next);
    },
    onError: (err: Error) => setError(err.message),
  });

  const resumeMutation = useMutation({
    mutationFn: () => resumePracticeSession(sessionId),
    onSuccess: async (next) => {
      setError(null);
      setRunning(true);
      await applySession(next);
    },
    onError: (err: Error) => setError(err.message),
  });

  const endMutation = useMutation({
    mutationFn: () => finishPracticeSession(sessionId),
    onSuccess: async (next) => {
      setError(null);
      clear();
      await queryClient.setQueryData(["practice-session", sessionId], next);
      router.push(`/practice/${sessionId}/summary`);
    },
    onError: (err: Error) => setError(err.message),
  });

  async function finishCurrent(
    action: "complete" | "skip",
  ): Promise<void> {
    if (!session || busy) return;
    const elapsed = Math.max(
      0,
      session.duration_per_image_seconds - remainingSeconds,
    );
    setBusy(true);
    setError(null);
    try {
      const next =
        action === "complete"
          ? await completePracticeImage(sessionId, elapsed)
          : await skipPracticeImage(sessionId, elapsed);
      await applySession(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  if (sessionQuery.isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted">Loading session…</p>
      </div>
    );
  }

  if (sessionQuery.isError || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
        <p className="text-sm text-bad" role="alert">
          {(sessionQuery.error as Error)?.message ?? "Session not found"}
        </p>
        <Link
          href="/boards"
          className="inline-flex min-h-11 items-center text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Boards
        </Link>
      </div>
    );
  }

  const current = session.current_image;
  const progressLabel = current
    ? `${current.order_number} of ${session.image_count}`
    : `${session.image_count} of ${session.image_count}`;
  const isPaused = session.status === "PAUSED";
  const urgent = remainingSeconds <= 10 && !isPaused;

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background lg:flex-row">
      {/* Image stage — content owns the viewport */}
      <section className="relative min-h-0 min-w-0 flex-1 bg-background">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={current.id}
            src={imageContentUrl(current.content_path)}
            alt={current.original_filename ?? "Practice reference"}
            className={`practice-ref absolute inset-0 h-full w-full object-contain p-4 sm:p-6 ${
              isPaused ? "practice-ref--paused" : ""
            }`}
          />
        ) : null}

        {isPaused ? (
          <div className="absolute inset-0 z-[5] flex items-center justify-center bg-background/50">
            <p className="rounded-sm bg-background/80 px-4 py-2 text-sm tracking-wide text-foreground">
              Paused
            </p>
          </div>
        ) : null}
      </section>

      {/* Controls: bottom on phone, right column on wide screens */}
      <aside className="z-10 shrink-0 border-t border-line bg-surface lg:flex lg:h-full lg:w-80 lg:flex-col lg:justify-center lg:border-l lg:border-t-0 xl:w-96">
        <div className="mx-auto w-full max-w-lg px-4 py-4 sm:px-6 sm:py-5 lg:max-w-none lg:px-8 lg:py-10">
          <div className="flex items-end justify-between gap-4 lg:flex-col lg:items-stretch">
            <div>
              <p className="text-sm text-muted">{progressLabel}</p>
              <p
                className={`mt-1 text-5xl font-semibold tracking-tight tabular-nums sm:text-6xl lg:mt-2 ${
                  urgent ? "text-accent" : "text-foreground"
                }`}
                aria-live="polite"
                aria-atomic="true"
              >
                {formatTimer(remainingSeconds)}
              </p>
            </div>
            <p className="pb-1 text-right text-sm text-muted lg:pb-0 lg:pt-4 lg:text-left">
              <span className="text-ok">{session.completed_count} done</span>
              <span className="mx-2 text-line">·</span>
              <span>{session.skipped_count} skipped</span>
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-2 lg:mt-8">
            <button
              type="button"
              disabled={busy || !current || isPaused}
              onClick={() => void finishCurrent("complete")}
              className="inline-flex min-h-12 w-full items-center justify-center bg-accent px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Complete
            </button>

            <div className="grid grid-cols-2 gap-2">
              {isPaused ? (
                <button
                  type="button"
                  disabled={resumeMutation.isPending || busy}
                  onClick={() => resumeMutation.mutate()}
                  className="inline-flex min-h-11 items-center justify-center border border-foreground px-3 text-sm text-foreground transition-colors hover:bg-foreground hover:text-background disabled:opacity-40"
                >
                  Resume
                </button>
              ) : (
                <button
                  type="button"
                  disabled={pauseMutation.isPending || busy}
                  onClick={() => pauseMutation.mutate()}
                  className="inline-flex min-h-11 items-center justify-center border border-line px-3 text-sm text-muted transition-colors hover:border-foreground hover:text-foreground disabled:opacity-40"
                >
                  Pause
                </button>
              )}
              <button
                type="button"
                disabled={busy || !current || isPaused}
                onClick={() => void finishCurrent("skip")}
                className="inline-flex min-h-11 items-center justify-center border border-line px-3 text-sm text-muted transition-colors hover:border-foreground hover:text-foreground disabled:opacity-40"
              >
                Skip
              </button>
            </div>
          </div>

          <button
            type="button"
            disabled={endMutation.isPending || busy}
            onClick={() => {
              if (
                confirm(
                  "End this session now? Remaining images will stay unfinished.",
                )
              ) {
                endMutation.mutate();
              }
            }}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center text-sm text-muted transition-colors hover:text-foreground disabled:opacity-40"
          >
            {endMutation.isPending ? "Ending…" : "End session"}
          </button>

          {error ? (
            <p className="mt-3 text-sm text-bad" role="alert">
              {error}
            </p>
          ) : (
            <p className="mt-3 text-xs leading-relaxed text-muted">
              {isPaused
                ? "Resume to continue the timer."
                : "Complete moves on. Skip keeps the image available later."}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
