"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

import { createPracticeSession } from "../../lib/api";

const DURATION_PRESETS = [
  { label: "30s", seconds: 30 },
  { label: "1m", seconds: 60 },
  { label: "2m", seconds: 120 },
  { label: "5m", seconds: 300 },
] as const;

type StartPracticeFormProps = {
  boardId: string;
  maxImages: number;
  className?: string;
};

export function StartPracticeForm({
  boardId,
  maxImages,
  className = "",
}: StartPracticeFormProps) {
  const router = useRouter();
  const [duration, setDuration] = useState(120);
  const [imageCount, setImageCount] = useState(
    Math.min(3, Math.max(1, maxImages)),
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setImageCount((current) =>
      Math.min(Math.max(1, current), Math.max(1, maxImages)),
    );
  }, [maxImages]);

  const startMutation = useMutation({
    mutationFn: () =>
      createPracticeSession({
        board_id: boardId,
        duration_per_image_seconds: duration,
        image_count: imageCount,
      }),
    onSuccess: (session) => {
      setError(null);
      router.push(`/practice/${session.id}`);
    },
    onError: (err: Error) => setError(err.message),
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (maxImages < 1) {
      setError("Upload at least one image before starting practice.");
      return;
    }
    startMutation.mutate();
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`border border-line bg-surface/50 px-5 py-5 ${className}`.trim()}
    >
      <p className="text-sm text-muted">
        Builds a queue from images still available on this board.
      </p>

      <fieldset className="mt-5">
        <legend className="text-sm text-muted">Duration per image</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {DURATION_PRESETS.map((preset) => (
            <button
              key={preset.seconds}
              type="button"
              onClick={() => setDuration(preset.seconds)}
              aria-pressed={duration === preset.seconds}
              className={`inline-flex min-h-11 min-w-11 items-center justify-center border px-3 text-sm transition-colors ${
                duration === preset.seconds
                  ? "border-accent bg-accent-soft text-foreground"
                  : "border-line text-muted hover:border-foreground hover:text-foreground"
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="mt-5 block">
        <span className="text-sm text-muted">Image count</span>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <input
            type="number"
            min={1}
            max={Math.max(1, maxImages)}
            value={imageCount}
            onChange={(event) =>
              setImageCount(
                Math.min(
                  Math.max(1, Number(event.target.value) || 1),
                  Math.max(1, maxImages),
                ),
              )
            }
            className="min-h-11 w-28 border border-line bg-background px-3 text-sm outline-none transition-shadow focus:ring-1 focus:ring-foreground"
          />
          <span className="text-sm text-muted">
            of {Math.max(0, maxImages)} available
          </span>
        </div>
      </label>

      {error ? (
        <p className="mt-4 text-sm text-bad" role="alert">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={startMutation.isPending || maxImages < 1}
        className="mt-6 inline-flex min-h-11 items-center bg-accent px-5 font-mono text-xs uppercase tracking-[0.16em] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
      >
        {startMutation.isPending ? "Starting…" : "Start session"}
      </button>
    </form>
  );
}
