"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { FormEvent, useState } from "react";

import { BoardCover } from "../components/BoardCover";
import { PinMeHeader } from "../components/PinMeHeader";
import { RequireAuth } from "../components/RequireAuth";
import { createBoard, deleteBoard, listBoards } from "../../lib/api";

const fieldClassName =
  "min-h-11 bg-surface px-3 text-sm text-foreground outline-none ring-1 ring-line transition-shadow focus:ring-foreground";

export default function BoardsPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  const boardsQuery = useQuery({
    queryKey: ["boards"],
    queryFn: listBoards,
  });

  const createMutation = useMutation({
    mutationFn: createBoard,
    onSuccess: async () => {
      setName("");
      setDescription("");
      setError(null);
      await queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBoard,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  }

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(229,9,20,0.1)_0%,_transparent_40%)]"
      />
      <PinMeHeader />
      <RequireAuth>
      <main className="relative mx-auto w-full max-w-5xl px-6 pb-20 sm:px-10">
        <h1 className="text-4xl font-semibold tracking-tight">Boards</h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
          Organize reference images, then start a timed practice session from
          what&apos;s still available.
        </p>

        <section className="mt-12 border-y border-line py-8">
          <h2 className="text-lg font-semibold tracking-tight">New board</h2>
          <p className="mt-1 text-sm text-muted">
            Give it a name you recognize — you can edit details later.
          </p>
          <form
            onSubmit={onSubmit}
            className="mt-6 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <label className="grid gap-2">
              <span className="text-sm text-muted">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClassName}
                placeholder="Anatomy"
                required
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm text-muted">Description</span>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={fieldClassName}
                placeholder="Optional"
              />
            </label>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex min-h-11 items-center justify-center bg-accent px-5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating…" : "Create board"}
            </button>
          </form>
          {error ? (
            <p className="mt-4 text-sm text-bad" role="alert">
              {error}
            </p>
          ) : null}
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight">Your boards</h2>
          {boardsQuery.isLoading ? (
            <p className="mt-6 text-sm text-muted">Loading boards…</p>
          ) : boardsQuery.isError ? (
            <p className="mt-6 text-sm text-bad" role="alert">
              {(boardsQuery.error as Error).message}
            </p>
          ) : boardsQuery.data?.length === 0 ? (
            <div className="mt-6 border border-line bg-surface/40 px-5 py-8">
              <p className="text-base text-foreground">No boards yet</p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                Create a board above, then open it to upload references and start
                practice.
              </p>
            </div>
          ) : (
            <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {boardsQuery.data?.map((board) => (
                <li key={board.id} className="group relative">
                  <Link
                    href={`/boards/${board.id}`}
                    className="block rounded-sm outline-offset-4"
                  >
                    <BoardCover
                      name={board.name}
                      previews={board.preview_images ?? []}
                    />
                    <span className="mt-3 block text-lg font-medium text-foreground transition-colors group-hover:text-white">
                      {board.name}
                    </span>
                    <p className="mt-1 text-sm text-muted">
                      {board.image_count}{" "}
                      {board.image_count === 1 ? "image" : "images"}
                      {board.description ? ` · ${board.description}` : ""}
                    </p>
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete board “${board.name}”?`)) {
                        deleteMutation.mutate(board.id);
                      }
                    }}
                    className="mt-1 inline-flex min-h-11 items-center text-sm text-muted/60 opacity-80 transition-colors hover:text-bad hover:opacity-100 focus-visible:text-bad focus-visible:opacity-100"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
      </RequireAuth>
    </div>
  );
}
