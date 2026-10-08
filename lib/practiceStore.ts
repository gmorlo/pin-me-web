"use client";

import { create } from "zustand";

type PracticeTimerState = {
  sessionId: string | null;
  remainingSeconds: number;
  durationSeconds: number;
  running: boolean;
  imageKey: string | null;
  hydrate: (input: {
    sessionId: string;
    durationSeconds: number;
    imageKey: string | null;
    running: boolean;
  }) => void;
  setRunning: (running: boolean) => void;
  tick: () => void;
  resetForImage: (imageKey: string | null, durationSeconds: number) => void;
  clear: () => void;
};

export const usePracticeStore = create<PracticeTimerState>((set, get) => ({
  sessionId: null,
  remainingSeconds: 0,
  durationSeconds: 0,
  running: false,
  imageKey: null,
  hydrate: ({ sessionId, durationSeconds, imageKey, running }) => {
    const current = get();
    if (
      current.sessionId === sessionId &&
      current.imageKey === imageKey &&
      current.durationSeconds === durationSeconds
    ) {
      set({ running });
      return;
    }
    set({
      sessionId,
      durationSeconds,
      remainingSeconds: durationSeconds,
      imageKey,
      running,
    });
  },
  setRunning: (running) => set({ running }),
  tick: () => {
    const { running, remainingSeconds } = get();
    if (!running || remainingSeconds <= 0) return;
    set({ remainingSeconds: remainingSeconds - 1 });
  },
  resetForImage: (imageKey, durationSeconds) =>
    set({
      imageKey,
      durationSeconds,
      remainingSeconds: durationSeconds,
    }),
  clear: () =>
    set({
      sessionId: null,
      remainingSeconds: 0,
      durationSeconds: 0,
      running: false,
      imageKey: null,
    }),
}));

export function formatTimer(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
