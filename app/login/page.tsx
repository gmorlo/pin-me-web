"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useEffect, useState } from "react";

import { PinMeHeader } from "../components/PinMeHeader";
import {
  ApiError,
  devLogin,
  getAuthStatus,
  getMe,
  googleLoginUrl,
} from "../../lib/api";

const fieldClassName =
  "min-h-11 bg-surface px-3 text-sm text-foreground outline-none ring-1 ring-line transition-shadow focus:ring-foreground";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const nextPath = searchParams.get("next") || "/boards";
  const errorParam = searchParams.get("error");
  const [email, setEmail] = useState("demo@pinme.local");
  const [error, setError] = useState<string | null>(null);

  const statusQuery = useQuery({
    queryKey: ["auth", "status"],
    queryFn: getAuthStatus,
  });

  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    retry: false,
  });

  useEffect(() => {
    if (meQuery.isSuccess) {
      router.replace(nextPath.startsWith("/") ? nextPath : "/boards");
    }
  }, [meQuery.isSuccess, nextPath, router]);

  const devMutation = useMutation({
    mutationFn: () => devLogin(email.trim()),
    onSuccess: async () => {
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      router.replace(nextPath.startsWith("/") ? nextPath : "/boards");
    },
    onError: (err: Error) => {
      if (err instanceof ApiError && err.status === 403) {
        setError("That email is not on the allowlist.");
      } else {
        setError(err.message);
      }
    },
  });

  function onDevSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    devMutation.mutate();
  }

  const oauthError =
    errorParam === "not_allowlisted"
      ? "That Google account is not allowlisted."
      : errorParam === "google_denied"
        ? "Google sign-in was cancelled."
        : errorParam
          ? "Sign-in failed. Try again."
          : null;

  return (
    <div className="mt-10 max-w-md">
      <h1 className="text-4xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-3 text-base leading-relaxed text-muted">
        Access is limited to allowlisted accounts. Sign in with Google, or use
        local dev login when enabled.
      </p>

      {(oauthError || error) && (
        <p className="mt-6 text-sm text-bad" role="alert">
          {error ?? oauthError}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3">
        {statusQuery.data?.google_configured ? (
          <a
            href={googleLoginUrl()}
            className="inline-flex min-h-12 items-center justify-center bg-accent px-5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            Continue with Google
          </a>
        ) : (
          <p className="text-sm text-muted">
            Google OAuth is not configured on the API yet. Use local login
            below, or set{" "}
            <code className="text-foreground">GOOGLE_CLIENT_ID</code> /{" "}
            <code className="text-foreground">GOOGLE_CLIENT_SECRET</code>.
          </p>
        )}
      </div>

      {statusQuery.data?.dev_bypass ? (
        <form
          onSubmit={onDevSubmit}
          className="mt-10 border-t border-line pt-8"
        >
          <h2 className="text-lg font-semibold tracking-tight">Local login</h2>
          <p className="mt-1 text-sm text-muted">
            Allowlisted email only ·{" "}
            <code className="text-foreground">AUTH_DEV_BYPASS</code>
          </p>
          <label className="mt-4 grid gap-2">
            <span className="text-sm text-muted">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={fieldClassName}
              required
            />
          </label>
          <button
            type="submit"
            disabled={devMutation.isPending}
            className="mt-4 inline-flex min-h-11 items-center border border-line px-4 text-sm text-foreground transition-colors hover:border-foreground disabled:opacity-40"
          >
            {devMutation.isPending ? "Signing in…" : "Sign in locally"}
          </button>
        </form>
      ) : null}

      <p className="mt-10 text-sm text-muted">
        <Link href="/" className="hover:text-foreground">
          ← Home
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(229,9,20,0.1)_0%,_transparent_40%)]"
      />
      <PinMeHeader />
      <main className="relative mx-auto w-full max-w-5xl px-6 pb-20 sm:px-10">
        <Suspense
          fallback={<p className="mt-10 text-sm text-muted">Loading…</p>}
        >
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
