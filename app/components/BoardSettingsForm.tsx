"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";

import { updateBoard } from "../../lib/api";

type BoardSettingsFormProps = {
  boardId: string;
  name: string;
  description: string | null;
};

/**
 * Board metadata settings. Keep source-link UI (Pinterest / Drive) as sibling
 * panels in this settings area later — do not fold sync into the page itself.
 */
export function BoardSettingsForm({
  boardId,
  name,
  description,
}: BoardSettingsFormProps) {
  const queryClient = useQueryClient();
  const [draftName, setDraftName] = useState(name);
  const [draftDescription, setDraftDescription] = useState(description ?? "");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setDraftName(name);
    setDraftDescription(description ?? "");
  }, [name, description]);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateBoard(boardId, {
        name: draftName.trim(),
        description: draftDescription.trim() ? draftDescription.trim() : null,
      }),
    onSuccess: async () => {
      setError(null);
      setMessage("Saved");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["board", boardId] }),
        queryClient.invalidateQueries({ queryKey: ["boards"] }),
      ]);
    },
    onError: (err: Error) => {
      setMessage(null);
      setError(err.message);
    },
  });

  const dirty =
    draftName.trim() !== name.trim() ||
    (draftDescription.trim() || "") !== (description?.trim() || "");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!draftName.trim() || !dirty) return;
    saveMutation.mutate();
  }

  return (
    <section className="mt-10 border-y border-line py-6">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted">
            Board settings
          </p>
          <p className="mt-1 text-sm text-muted">
            Name and description. Source links (Pinterest / Drive) will land in
            this settings area later.
          </p>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <label className="grid gap-2">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
            Name
          </span>
          <input
            value={draftName}
            onChange={(e) => {
              setDraftName(e.target.value);
              setMessage(null);
            }}
            className="bg-surface px-3 py-2 text-sm text-foreground outline-none ring-1 ring-line focus:ring-accent"
            required
            maxLength={200}
          />
        </label>
        <label className="grid gap-2">
          <span className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
            Description
          </span>
          <input
            value={draftDescription}
            onChange={(e) => {
              setDraftDescription(e.target.value);
              setMessage(null);
            }}
            className="bg-surface px-3 py-2 text-sm text-foreground outline-none ring-1 ring-line focus:ring-accent"
            placeholder="Optional"
            maxLength={2000}
          />
        </label>
        <button
          type="submit"
          disabled={!dirty || !draftName.trim() || saveMutation.isPending}
          className="bg-accent px-4 py-2 font-mono text-xs uppercase tracking-[0.14em] text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {saveMutation.isPending ? "Saving…" : "Save"}
        </button>
      </form>

      {error ? (
        <p className="mt-3 font-mono text-sm text-bad">{error}</p>
      ) : null}
      {message ? (
        <p className="mt-3 font-mono text-sm text-ok">{message}</p>
      ) : null}
    </section>
  );
}
