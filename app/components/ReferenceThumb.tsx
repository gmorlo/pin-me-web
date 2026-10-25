"use client";

import { useState } from "react";

type ReferenceThumbProps = {
  src: string;
  alt: string;
  onDelete?: () => void;
  deleteBusy?: boolean;
};

/** Board / practice thumbnail with broken-object fallback (e.g. lost S3Mock data). */
export function ReferenceThumb({
  src,
  alt,
  onDelete,
  deleteBusy = false,
}: ReferenceThumbProps) {
  const [failed, setFailed] = useState(false);

  return (
    <li className="group relative overflow-hidden bg-surface">
      {failed ? (
        <div
          className="flex aspect-square flex-col items-center justify-center gap-1 px-3 text-center"
          role="img"
          aria-label={`${alt} — file missing`}
        >
          <p className="text-sm text-foreground">Missing file</p>
          <p className="text-xs leading-relaxed text-muted">
            Re-upload or delete this reference.
          </p>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="aspect-square w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
      {onDelete ? (
        <button
          type="button"
          disabled={deleteBusy}
          onClick={onDelete}
          className="absolute right-2 top-2 inline-flex min-h-9 items-center bg-background/90 px-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted opacity-0 transition-opacity hover:text-bad focus-visible:opacity-100 group-hover:opacity-100 disabled:opacity-40"
        >
          Delete
        </button>
      ) : null}
    </li>
  );
}
