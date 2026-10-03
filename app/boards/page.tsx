"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { FormEvent, useState } from "react";

import { SiteHeader } from "../components/SiteHeader";
import { createBoard, deleteBoard, listBoards } from "../../lib/api";

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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(229,9,20,0.12)_0%,_transparent_40%)]"
      />
      <SiteHeader />
      <main className="relative mx-auto w-full max-w-5xl px-6 pb-20 sm:px-10">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-accent">
          Library
        </p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Boards</h1>
        <p className="mt-3 max-w-xl text-muted">
          Create reference boards and upload bootstrap images. Later stages will
          link boards to Pinterest / Drive without changing this practice model.
        </p>

        <form
          onSubmit={onSubmit}
          className="mt-10 grid gap-4 border-y border-line py-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <label className="grid gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
              Name
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-surface px-3 py-2 text-sm text-foreground outline-none ring-1 ring-line focus:ring-accent"
              placeholder="Anatomy"
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
              Description
            </span>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-surface px-3 py-2 text-sm text-foreground outline-none ring-1 ring-line focus:ring-accent"
              placeholder="Optional"
            />
          </label>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="bg-accent px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {createMutation.isPending ? "Creating…" : "Create"}
          </button>
        </form>

        {error ? (
          <p className="mt-4 font-mono text-sm text-bad">{error}</p>
        ) : null}

        <section className="mt-8">
          {boardsQuery.isLoading ? (
            <p className="font-mono text-sm text-muted">Loading boards…</p>
          ) : boardsQuery.isError ? (
            <p className="font-mono text-sm text-bad">
              {(boardsQuery.error as Error).message}
            </p>
          ) : boardsQuery.data?.length === 0 ? (
            <p className="font-mono text-sm text-muted">No boards yet.</p>
          ) : (
            <ul className="divide-y divide-line border-y border-line">
              {boardsQuery.data?.map((board) => (
                <li
                  key={board.id}
                  className="flex flex-wrap items-center justify-between gap-4 py-4"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/boards/${board.id}`}
                      className="text-lg font-medium text-foreground transition-colors hover:text-accent"
                    >
                      {board.name}
                    </Link>
                    <p className="mt-1 font-mono text-xs text-muted">
                      {board.image_count} images
                      {board.description ? ` · ${board.description}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Delete board “${board.name}”?`)) {
                        deleteMutation.mutate(board.id);
                      }
                    }}
                    className="font-mono text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-bad"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
