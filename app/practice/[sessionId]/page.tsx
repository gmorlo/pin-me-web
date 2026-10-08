"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
        <p className="font-mono text-sm text-muted">Loading session…</p>
      </div>
    );
  }

  if (sessionQuery.isError || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
        <p className="font-mono text-sm text-bad">
          {(sessionQuery.error as Error)?.message ?? "Session not found"}
        </p>
        <Link
          href="/boards"
          className="font-mono text-xs uppercase tracking-[0.16em] text-muted hover:text-foreground"
        >
          ← Boards
        </Link>
      </div>
    );
  }

  const current = session.current_image;
  const orderLabel = current
    ? `${current.order_number} / ${session.image_count}`
    : `${session.image_count} / ${session.image_count}`;
  const isPaused = session.status === "PAUSED";

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background lg:flex-row">
      {/* Image stage — never covered by the control panel */}
      <section className="relative min-h-0 min-w-0 flex-1">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(229,9,20,0.1)_0%,_transparent_55%)]"
        />

        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={current.id}
            src={imageContentUrl(current.content_path)}
            alt={current.original_filename ?? "Practice reference"}
            className={`practice-ref absolute inset-0 h-full w-full object-contain p-3 animate-fade-up sm:p-5 ${
              isPaused ? "practice-ref--paused" : ""
            }`}
          />
        ) : null}

        {isPaused ? (
          <div
            aria-hidden
            className="absolute inset-0 z-[5] bg-background/30 backdrop-blur-[2px] transition-opacity duration-300"
          />
        ) : null}
      </section>

      {/* Controls: bottom on phone, right column on wide screens */}
      <aside className="z-10 shrink-0 border-t border-line bg-surface/95 backdrop-blur-md lg:flex lg:h-full lg:w-80 lg:flex-col lg:justify-center lg:border-l lg:border-t-0 xl:w-96">
        <div className="mx-auto w-full max-w-lg px-4 py-4 sm:px-6 sm:py-5 lg:max-w-none lg:px-7 lg:py-8">
          <div className="flex items-end justify-between gap-3 lg:flex-col lg:items-stretch lg:gap-1">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                Practice · {orderLabel}
              </p>
              <p
                className={`mt-1 font-mono text-4xl tracking-tight sm:text-5xl lg:mt-2 ${
                  remainingSeconds <= 10 && !isPaused
                    ? "text-accent animate-pulse-soft"
                    : ""
                }`}
              >
                {formatTimer(remainingSeconds)}
              </p>
            </div>
            <p className="pb-1 text-right font-mono text-[11px] uppercase tracking-[0.16em] lg:pb-0 lg:pt-3 lg:text-left">
              <span className="text-ok">{session.completed_count} completed</span>
              <span className="mx-2 text-line">·</span>
              <span className="text-warn">{session.skipped_count} skipped</span>
            </p>
          </div>

          {isPaused ? (
            <p className="mt-3 font-mono text-xs uppercase tracking-[0.2em] text-accent lg:mt-5">
              Paused
            </p>
          ) : null}

          <div className="mt-4 grid grid-cols-3 gap-2 lg:mt-6 lg:grid-cols-1">
            {isPaused ? (
              <button
                type="button"
                disabled={resumeMutation.isPending || busy}
                onClick={() => resumeMutation.mutate()}
                className="border border-accent bg-accent-soft px-3 py-3 font-mono text-xs uppercase tracking-[0.14em] transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                Resume
              </button>
            ) : (
              <button
                type="button"
                disabled={pauseMutation.isPending || busy}
                onClick={() => pauseMutation.mutate()}
                className="border border-line bg-background/80 px-3 py-3 font-mono text-xs uppercase tracking-[0.14em] transition-colors hover:border-accent disabled:opacity-40"
              >
                Pause
              </button>
            )}
            <button
              type="button"
              disabled={busy || !current || isPaused}
              onClick={() => void finishCurrent("skip")}
              className="border border-line bg-background/80 px-3 py-3 font-mono text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:border-warn hover:text-foreground disabled:opacity-40"
            >
              Skip
            </button>
            <button
              type="button"
              disabled={busy || !current || isPaused}
              onClick={() => void finishCurrent("complete")}
              className="bg-accent px-3 py-3 font-mono text-xs uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              Complete
            </button>
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
            className="mt-3 w-full border border-line px-3 py-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-muted transition-colors hover:border-foreground hover:text-foreground disabled:opacity-40 lg:mt-4"
          >
            {endMutation.isPending ? "Ending…" : "End session"}
          </button>

          {error ? (
            <p className="mt-3 font-mono text-sm text-bad">{error}</p>
          ) : (
            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted/70">
              {isPaused
                ? "Resume to continue the timer"
                : "Complete advances · Skip leaves AVAILABLE"}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
