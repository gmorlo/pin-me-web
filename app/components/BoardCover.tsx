"use client";

import { useState } from "react";

import { imageContentUrl, type BoardPreviewImage } from "../../lib/api";

type BoardCoverProps = {
  /** Board name; cover itself is decorative — accessible name comes from adjacent title. */
  name: string;
  previews: BoardPreviewImage[];
  className?: string;
};

function CoverCell({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className="h-full w-full bg-line/40" />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="h-full w-full object-cover" onError={() => setFailed(true)} />
  );
}

function cellSrc(image: BoardPreviewImage): string {
  return imageContentUrl(image.content_path);
}

/**
 * Adaptive board avatar: equal split by count — 1 full, 2 halves, 3 thirds, 4 = 2×2.
 * Always decorative (`aria-hidden`); pair with a visible title for the accessible name.
 */
export function BoardCover({ previews, className = "" }: BoardCoverProps) {
  const cells = previews.slice(0, 4);
  const shell = `aspect-square overflow-hidden bg-surface ${className}`;

  if (cells.length === 0) {
    return <div className={shell} aria-hidden />;
  }

  if (cells.length === 1) {
    return (
      <div className={shell} aria-hidden>
        <CoverCell src={cellSrc(cells[0])} />
      </div>
    );
  }

  if (cells.length === 2 || cells.length === 3) {
    return (
      <div
        className={`grid aspect-square gap-px overflow-hidden bg-line ${
          cells.length === 2 ? "grid-cols-2" : "grid-cols-3"
        } ${className}`}
        aria-hidden
      >
        {cells.map((cell) => (
          <CoverCell key={cell.id} src={cellSrc(cell)} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`grid aspect-square grid-cols-2 grid-rows-2 gap-px overflow-hidden bg-line ${className}`}
      aria-hidden
    >
      {cells.map((cell) => (
        <CoverCell key={cell.id} src={cellSrc(cell)} />
      ))}
    </div>
  );
}
