"use client";

import { useCallback, useEffect, useState } from "react";

import { apiBaseUrl } from "../../lib/api";

type HealthState =
  | { kind: "loading" }
  | { kind: "ok"; status: string; latencyMs: number; raw: string }
  | { kind: "error"; message: string; latencyMs?: number };

export function ApiHealthStatus() {
  const base = apiBaseUrl();
  const [state, setState] = useState<HealthState>({ kind: "loading" });
  const [expanded, setExpanded] = useState(false);

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

  const summary =
    state.kind === "loading"
      ? "Checking server…"
      : state.kind === "ok"
        ? "Server connected"
        : "Server unreachable";

  const tone =
    state.kind === "ok" ? "ok" : state.kind === "error" ? "bad" : "warn";

  return (
    <section className="animate-fade-up mt-12 w-full max-w-xl" aria-live="polite">
      <div className="flex flex-wrap items-center justify-between gap-3 border-y border-line py-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className={[
              "inline-block size-2.5 shrink-0 rounded-full",
              tone === "ok"
                ? "bg-ok"
                : tone === "bad"
                  ? "bg-bad"
                  : "bg-warn",
              state.kind === "ok" ? "animate-pulse-soft" : "",
            ].join(" ")}
            aria-hidden
          />
          <p className="text-sm text-foreground">
            {summary}
            <span className="sr-only">
              {tone === "ok"
                ? " Status good."
                : tone === "bad"
                  ? " Status error."
                  : " Status pending."}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => void check()}
            className="inline-flex min-h-11 items-center px-2 font-mono text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-foreground"
          >
            Recheck
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="inline-flex min-h-11 items-center px-2 font-mono text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-foreground"
          >
            {expanded ? "Hide details" : "Details"}
          </button>
        </div>
      </div>

      {expanded ? (
        <dl className="divide-y divide-line border-b border-line">
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
          />
          <StatusRow
            label="Latency"
            value={
              state.kind === "loading" ? "—" : `${state.latencyMs ?? "—"} ms`
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
      ) : null}
    </section>
  );
}

function StatusRow({
  label,
  value,
  mono = false,
  tone,
}: {
  label: string;
  value: string;
  mono?: boolean;
  tone?: "ok" | "warn" | "bad";
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
      <dd className="min-w-0">
        <span
          className={[
            "block truncate text-sm",
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
