"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";

import { BoardCover } from "../../components/BoardCover";
import { BoardSettingsForm } from "../../components/BoardSettingsForm";
import { PinMeHeader } from "../../components/PinMeHeader";
import { ReferenceThumb } from "../../components/ReferenceThumb";
import { RequireAuth } from "../../components/RequireAuth";
import { StartPracticeForm } from "../../components/StartPracticeForm";
import {
  deleteImage,
  getBoard,
  IMAGE_PAGE_SIZE,
  imageContentUrl,
  listImages,
  resetBoardProgress,
  uploadImages,
  type ReferenceImage,
} from "../../../lib/api";

export default function BoardDetailPage() {
  const params = useParams<{ id: string }>();
  const boardId = params.id;
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [extraImages, setExtraImages] = useState<ReferenceImage[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const boardQuery = useQuery({
    queryKey: ["board", boardId],
    queryFn: () => getBoard(boardId),
  });

  const imagesQuery = useQuery({
    queryKey: ["images", boardId],
    queryFn: () => listImages(boardId, { limit: IMAGE_PAGE_SIZE, offset: 0 }),
  });

  const firstPage = imagesQuery.data?.items ?? [];
  const total = imagesQuery.data?.total ?? 0;
  const shownImages = [...firstPage, ...extraImages];
  const hasMore = shownImages.length < total;

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) =>
      uploadImages(boardId, files, (done, total) => {
        setUploadProgress({ done, total });
      }),
    onSuccess: async (result) => {
      setUploadProgress(null);
      setExtraImages([]);
      if (result.failures.length === 0) {
        setError(null);
      } else {
        const failed = result.failures
          .map((f) => `${f.name}: ${f.message}`)
          .join("; ");
        setError(
          result.uploaded.length > 0
            ? `Uploaded ${result.uploaded.length}, failed ${result.failures.length}. ${failed}`
            : failed,
        );
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["images", boardId] }),
        queryClient.invalidateQueries({ queryKey: ["board", boardId] }),
        queryClient.invalidateQueries({ queryKey: ["boards"] }),
      ]);
    },
    onError: (err: Error) => {
      setUploadProgress(null);
      setError(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (imageId: string) => deleteImage(boardId, imageId),
    onSuccess: async () => {
      setExtraImages([]);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["images", boardId] }),
        queryClient.invalidateQueries({ queryKey: ["board", boardId] }),
        queryClient.invalidateQueries({ queryKey: ["boards"] }),
      ]);
    },
    onError: (err: Error) => setError(err.message),
  });

  const resetMutation = useMutation({
    mutationFn: () => resetBoardProgress(boardId),
    onSuccess: async () => {
      setError(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["images", boardId] }),
        queryClient.invalidateQueries({ queryKey: ["board", boardId] }),
      ]);
    },
    onError: (err: Error) => setError(err.message),
  });

  async function loadMore() {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    setError(null);
    try {
      const page = await listImages(boardId, {
        limit: IMAGE_PAGE_SIZE,
        offset: shownImages.length,
      });
      setExtraImages((prev) => {
        const seen = new Set([
          ...firstPage.map((image) => image.id),
          ...prev.map((image) => image.id),
        ]);
        return [...prev, ...page.items.filter((image) => !seen.has(image.id))];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load more");
    } finally {
      setLoadingMore(false);
    }
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
        <Link
          href="/boards"
          className="inline-flex min-h-11 items-center text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Boards
        </Link>

        {boardQuery.isLoading ? (
          <p className="mt-8 text-sm text-muted">Loading board…</p>
        ) : boardQuery.isError ? (
          <p className="mt-8 text-sm text-bad" role="alert">
            {(boardQuery.error as Error).message}
          </p>
        ) : (
          <>
            <header className="mt-2 grid gap-6 sm:grid-cols-[minmax(0,11rem)_1fr] sm:items-end">
              <BoardCover
                name={boardQuery.data?.name ?? "Board"}
                previews={boardQuery.data?.preview_images ?? []}
                className="w-full max-w-[11rem]"
              />
              <div>
                <h1 className="text-4xl font-semibold tracking-tight">
                  {boardQuery.data?.name}
                </h1>
                {boardQuery.data?.description ? (
                  <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted">
                    {boardQuery.data.description}
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-muted">
                  {boardQuery.data?.image_count ?? 0}{" "}
                  {(boardQuery.data?.image_count ?? 0) === 1
                    ? "image"
                    : "images"}
                </p>
              </div>
            </header>

            <section className="mt-10">
              <h2 className="text-lg font-semibold tracking-tight">Practice</h2>
              <StartPracticeForm
                boardId={boardId}
                maxImages={boardQuery.data?.image_count ?? 0}
                className="mt-4"
              />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  disabled={resetMutation.isPending}
                  onClick={() => {
                    if (
                      confirm(
                        "Reset all practice progress on this board to AVAILABLE? Completion history is kept.",
                      )
                    ) {
                      resetMutation.mutate();
                    }
                  }}
                  className="inline-flex min-h-11 items-center border border-line px-4 text-sm text-muted transition-colors hover:border-warn hover:text-foreground disabled:opacity-40"
                >
                  {resetMutation.isPending ? "Resetting…" : "Reset progress"}
                </button>
                {resetMutation.isSuccess ? (
                  <p className="text-sm text-ok">
                    Reset {resetMutation.data.reset_count} progress row
                    {resetMutation.data.reset_count === 1 ? "" : "s"}.
                  </p>
                ) : null}
              </div>
            </section>

            <section className="mt-14">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    References
                  </h2>
                  <p className="mt-1 text-sm text-muted">
                    JPEG, PNG, or WebP · max 5 MB each
                    {total > 0
                      ? ` · showing ${shownImages.length} of ${total}`
                      : ""}
                  </p>
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    multiple={true}
                    className="sr-only"
                    tabIndex={-1}
                    disabled={uploadMutation.isPending}
                    onChange={(event) => {
                      const files = Array.from(event.target.files ?? []);
                      if (files.length > 0) uploadMutation.mutate(files);
                      event.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    disabled={uploadMutation.isPending}
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex min-h-11 items-center border border-line bg-surface px-4 text-sm font-medium text-accent transition-colors hover:border-foreground disabled:opacity-40"
                  >
                    {uploadMutation.isPending && uploadProgress
                      ? `Uploading ${uploadProgress.done}/${uploadProgress.total}…`
                      : uploadMutation.isPending
                        ? "Uploading…"
                        : "Add images"}
                  </button>
                </div>
              </div>

              {error ? (
                <p className="mt-4 text-sm text-bad" role="alert">
                  {error}
                </p>
              ) : null}

              <div className="mt-6">
                {imagesQuery.isLoading ? (
                  <p className="text-sm text-muted">Loading images…</p>
                ) : imagesQuery.isError ? (
                  <p className="text-sm text-bad" role="alert">
                    {(imagesQuery.error as Error).message}
                  </p>
                ) : shownImages.length === 0 ? (
                  <div className="border border-line bg-surface/40 px-5 py-8">
                    <p className="text-base text-foreground">No images yet</p>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
                      Add at least one reference before starting practice.
                    </p>
                  </div>
                ) : (
                  <>
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                      {shownImages.map((image) => (
                        <ReferenceThumb
                          key={image.id}
                          src={imageContentUrl(image.content_path)}
                          alt={image.original_filename ?? "Reference"}
                          deleteBusy={deleteMutation.isPending}
                          onDelete={() => {
                            if (confirm("Delete this image?")) {
                              deleteMutation.mutate(image.id);
                            }
                          }}
                        />
                      ))}
                    </ul>
                    {hasMore ? (
                      <button
                        type="button"
                        disabled={loadingMore}
                        onClick={() => void loadMore()}
                        className="mt-6 inline-flex min-h-11 items-center border border-line px-4 text-sm text-muted transition-colors hover:border-foreground hover:text-foreground disabled:opacity-40"
                      >
                        {loadingMore
                          ? "Loading…"
                          : `Show more (${total - shownImages.length} left)`}
                      </button>
                    ) : null}
                  </>
                )}
              </div>
            </section>

            <section className="mt-14 border-t border-line pt-8">
              <button
                type="button"
                aria-expanded={settingsOpen}
                onClick={() => setSettingsOpen((open) => !open)}
                className="inline-flex min-h-11 items-center text-sm text-muted transition-colors hover:text-foreground"
              >
                {settingsOpen ? "Hide settings" : "Board settings"}
              </button>
              {settingsOpen && boardQuery.data ? (
                <BoardSettingsForm
                  boardId={boardId}
                  name={boardQuery.data.name}
                  description={boardQuery.data.description}
                  className="mt-4"
                />
              ) : null}
            </section>
          </>
        )}
      </main>
      </RequireAuth>
    </div>
  );
}
