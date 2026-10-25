"use client";

import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { ApiError, getMe } from "../../lib/api";

type RequireAuthProps = {
  children: ReactNode;
};

/** Client gate: redirect to /login when the session cookie is missing. */
export function RequireAuth({ children }: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const meQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: getMe,
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!meQuery.isError) return;
    const err = meQuery.error;
    if (err instanceof ApiError && err.status === 401) {
      const next = encodeURIComponent(pathname || "/boards");
      router.replace(`/login?next=${next}`);
    }
  }, [meQuery.isError, meQuery.error, pathname, router]);

  if (meQuery.isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-muted">Checking session…</p>
      </div>
    );
  }

  if (meQuery.isError) {
    const err = meQuery.error;
    if (err instanceof ApiError && err.status === 401) {
      return (
        <div className="flex min-h-[40vh] items-center justify-center">
          <p className="text-sm text-muted">Redirecting to login…</p>
        </div>
      );
    }
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-6">
        <p className="text-sm text-bad" role="alert">
          {(err as Error).message}
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
