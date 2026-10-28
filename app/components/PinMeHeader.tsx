"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { getMe, logout } from "../../lib/api";
import { PORTFOLIO_URL } from "../../lib/site";

/** Site header for the PinMe product surface. */
export function PinMeHeader() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    retry: false,
    staleTime: 60_000,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: async () => {
      await queryClient.resetQueries({ queryKey: ["auth", "me"] });
      router.push("/login");
    },
  });

  return (
    <header className="relative z-10 mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-5 sm:px-10 sm:py-6">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center text-lg font-semibold tracking-tight text-foreground"
      >
        PinMe
      </Link>
      <nav
        aria-label="Primary"
        className="flex items-center gap-1 text-sm text-muted sm:gap-2"
      >
        <Link
          href="/boards"
          className="inline-flex min-h-11 items-center px-2 transition-colors hover:text-foreground"
        >
          Boards
        </Link>
        <a
          href={PORTFOLIO_URL}
          className="inline-flex min-h-11 items-center px-2 transition-colors hover:text-foreground"
          rel="noreferrer"
        >
          Portfolio
        </a>
        {meQuery.isSuccess ? (
          <>
            <span className="hidden max-w-[10rem] truncate px-2 text-xs sm:inline">
              {meQuery.data.email}
            </span>
            <button
              type="button"
              disabled={logoutMutation.isPending}
              onClick={() => logoutMutation.mutate()}
              className="inline-flex min-h-11 items-center px-2 transition-colors hover:text-foreground disabled:opacity-40"
            >
              Log out
            </button>
          </>
        ) : (
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center px-2 transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
        )}
      </nav>
    </header>
  );
}
