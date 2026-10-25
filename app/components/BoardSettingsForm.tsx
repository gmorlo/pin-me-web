"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormEvent, useEffect, useState } from "react";

import { updateBoard } from "../../lib/api";

type BoardSettingsFormProps = {
  boardId: string;
  name: string;
  description: string | null;
  className?: string;
};

const fieldClassName =
  "min-h-11 bg-surface px-3 text-sm text-foreground outline-none ring-1 ring-line transition-shadow focus:ring-foreground";

/**
 * Board metadata settings. Keep source-link UI (Pinterest / Drive) as sibling
 * panels in this settings area later — do not fold sync into the page itself.
 */
export function BoardSettingsForm({
  boardId,
  name,
  description,
  className = "",
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
    <section className={className}>
      <p className="text-sm text-muted">
        Name and description for this board.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-4 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
      >
        <label className="grid gap-2">
          <span className="text-sm text-muted">Name</span>
          <input
            value={draftName}
            onChange={(e) => {
              setDraftName(e.target.value);
              setMessage(null);
            }}
            className={fieldClassName}
            required
            maxLength={200}
          />
        </label>
        <label className="grid gap-2">
          <span className="text-sm text-muted">Description</span>
          <input
            value={draftDescription}
            onChange={(e) => {
              setDraftDescription(e.target.value);
              setMessage(null);
            }}
            className={fieldClassName}
            placeholder="Optional"
            maxLength={2000}
          />
        </label>
        <button
          type="submit"
          disabled={!dirty || !draftName.trim() || saveMutation.isPending}
          className="inline-flex min-h-11 items-center justify-center border border-line px-4 text-sm text-foreground transition-colors hover:border-foreground disabled:opacity-40"
        >
          {saveMutation.isPending ? "Saving…" : "Save changes"}
        </button>
      </form>

      {error ? (
        <p className="mt-3 text-sm text-bad" role="alert">
          {error}
        </p>
      ) : null}
      {message ? <p className="mt-3 text-sm text-ok">{message}</p> : null}
    </section>
  );
}
