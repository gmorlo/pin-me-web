"use client";

import { useCallback, useEffect, useState } from "react";

type HealthState =
  | { kind: "loading" }
  | { kind: "ok"; status: string; latencyMs: number; raw: string }
  | { kind: "error"; message: string; latencyMs?: number };

function apiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(
    /\/$/,
    "",
  );
}

export function ApiHealthStatus() {
  const base = apiBaseUrl();
  const [state, setState] = useState<HealthState>({ kind: "loading" });

  const check = useCallback(async () => {
    setState({ kind: "loading" });
    const started = performance.now();
    try {
      const response = await fetch(`${base}/health`, {
        cache: "no-store",
      });
      const latencyMs = Math.round(performance.now() - started);
      const text = await response.text();
      let status = "unknown";
      try {
        const json = JSON.parse(text) as { status?: string };
        status = json.status ?? status;
      } catch {
        status = response.ok ? "ok" : "error";
      }
      if (!response.ok) {
        setState({
          kind: "error",
          message: `HTTP ${response.status}: ${text || response.statusText}`,
          latencyMs,
        });
        return;
      }
      setState({
        kind: "ok",
        status,
        latencyMs,
        raw: text,
      });
    } catch (error) {
      const latencyMs = Math.round(performance.now() - started);
      setState({
        kind: "error",
        message:
          error instanceof Error ? error.message : "Failed to reach API",
        latencyMs,
      });
    }
  }, [base]);

  useEffect(() => {
    void check();
  }, [check]);

  const tone =
    state.kind === "ok" ? "ok" : state.kind === "error" ? "bad" : "warn";

  return (
    <section className="animate-fade-up mt-10 w-full max-w-xl" aria-live="polite">
      <div className="mb-3 flex items-center justify-between gap-4">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
          API connectivity
        </p>
        <button
          type="button"
          onClick={() => void check()}
          className="font-mono text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-foreground"
        >
          Recheck
        </button>
      </div>

      <dl className="divide-y divide-line border-y border-line">
        <StatusRow label="Base URL" value={base} mono />
        <StatusRow
          label="State"
          value={
            state.kind === "loading"
              ? "checking…"
              : state.kind === "ok"
                ? state.status
                : "unreachable"
          }
          tone={tone}
          pulse={state.kind === "ok"}
        />
        <StatusRow
          label="Latency"
          value={
            state.kind === "loading"
              ? "—"
              : `${state.latencyMs ?? "—"} ms`
          }
          mono
        />
        <StatusRow
          label="Payload"
          value={
            state.kind === "ok"
              ? state.raw
              : state.kind === "error"
                ? state.message
                : "awaiting response"
          }
          mono
        />
      </dl>
    </section>
  );
}

function StatusRow({
  label,
  value,
  mono = false,
  tone,
  pulse = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: "ok" | "warn" | "bad";
  pulse?: boolean;
}) {
  const toneClass =
    tone === "ok"
      ? "text-ok"
      : tone === "bad"
        ? "text-bad"
        : tone === "warn"
          ? "text-warn"
          : "text-foreground";

  return (
    <div className="grid grid-cols-[7.5rem_1fr] items-center gap-4 py-3.5 sm:grid-cols-[9rem_1fr]">
      <dt className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
        {label}
      </dt>
      <dd className="flex min-w-0 items-center gap-2.5">
        {tone ? (
          <span
            className={[
              "inline-block size-2 shrink-0 rounded-full",
              tone === "ok"
                ? "bg-ok"
                : tone === "bad"
                  ? "bg-bad"
                  : "bg-warn",
              pulse ? "animate-pulse-soft" : "",
            ].join(" ")}
            aria-hidden
          />
        ) : null}
        <span
          className={[
            "truncate text-sm sm:text-[0.95rem]",
            mono ? "font-mono" : "",
            toneClass,
          ].join(" ")}
          title={value}
        >
          {value}
        </span>
      </dd>
    </div>
  );
}
