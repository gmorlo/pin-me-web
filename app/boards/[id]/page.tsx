"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { BoardSettingsForm } from "../../components/BoardSettingsForm";
import { SiteHeader } from "../../components/SiteHeader";
import {
  deleteImage,
  getBoard,
  imageContentUrl,
  listImages,
  uploadImage,
} from "../../../lib/api";

export default function BoardDetailPage() {
  const params = useParams<{ id: string }>();
  const boardId = params.id;
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const boardQuery = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => getBoard(boardId),
  });

  const imagesQuery = useQuery({
    queryKey: ["images", boardId],
    queryFn: () => listImages(boardId),
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadImage(boardId, file),
    onSuccess: async () => {
      setError(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["images", boardId] }),
        queryClient.invalidateQueries({ queryKey: ["board", boardId] }),
        queryClient.invalidateQueries({ queryKey: ["boards"] }),
      ]);
    },
    onError: (err: Error) => setError(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (imageId: string) => deleteImage(boardId, imageId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["images", boardId] }),
        queryClient.invalidateQueries({ queryKey: ["board", boardId] }),
        queryClient.invalidateQueries({ queryKey: ["boards"] }),
      ]);
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <div className="relative min-h-screen">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(229,9,20,0.12)_0%,_transparent_40%)]"
      />
      <SiteHeader />
      <main className="relative mx-auto w-full max-w-5xl px-6 pb-20 sm:px-10">
        <Link
          href="/boards"
          className="font-mono text-xs uppercase tracking-[0.16em] text-muted transition-colors hover:text-foreground"
        >
          ← Boards
        </Link>

        {boardQuery.isLoading ? (
          <p className="mt-8 font-mono text-sm text-muted">Loading board…</p>
        ) : boardQuery.isError ? (
          <p className="mt-8 font-mono text-sm text-bad">
            {(boardQuery.error as Error).message}
          </p>
        ) : (
          <>
            <h1 className="mt-4 text-4xl font-semibold tracking-tight">
              {boardQuery.data?.name}
            </h1>
            {boardQuery.data?.description ? (
              <p className="mt-3 text-muted">{boardQuery.data.description}</p>
            ) : null}
            <p className="mt-2 font-mono text-xs uppercase tracking-[0.14em] text-muted">
              {boardQuery.data?.image_count ?? 0} images · LOCAL_UPLOAD bootstrap
            </p>

            {boardQuery.data ? (
              <BoardSettingsForm
                boardId={boardId}
                name={boardQuery.data.name}
                description={boardQuery.data.description}
              />
            ) : null}

            <label className="mt-10 inline-flex cursor-pointer items-center gap-3 border border-line bg-surface px-4 py-3 font-mono text-xs uppercase tracking-[0.14em] transition-colors hover:border-accent">
              <span className="text-accent">Upload</span>
              <span className="text-muted">JPEG / PNG / WebP · max 5 MB</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={uploadMutation.isPending}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) uploadMutation.mutate(file);
                  event.target.value = "";
                }}
              />
            </label>

            {error ? (
              <p className="mt-4 font-mono text-sm text-bad">{error}</p>
            ) : null}
            {uploadMutation.isPending ? (
              <p className="mt-4 font-mono text-sm text-muted">Uploading…</p>
            ) : null}

            <section className="mt-10">
              {imagesQuery.isLoading ? (
                <p className="font-mono text-sm text-muted">Loading images…</p>
              ) : imagesQuery.isError ? (
                <p className="font-mono text-sm text-bad">
                  {(imagesQuery.error as Error).message}
                </p>
              ) : imagesQuery.data?.length === 0 ? (
                <p className="font-mono text-sm text-muted">
                  No images on this board yet.
                </p>
              ) : (
                <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                  {imagesQuery.data?.map((image) => (
                    <li key={image.id} className="group relative overflow-hidden bg-surface">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageContentUrl(image.content_path)}
                        alt={image.original_filename ?? "Reference"}
                        className="aspect-square w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm("Delete this image?")) {
                            deleteMutation.mutate(image.id);
                          }
                        }}
                        className="absolute right-2 top-2 bg-background/80 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted opacity-0 transition-opacity group-hover:opacity-100 hover:text-bad"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
