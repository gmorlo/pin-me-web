export type Board = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  image_count: number;
};

export type ReferenceImage = {
  id: string;
  board_id: string;
  source_type: string;
  storage_key: string | null;
  file_url: string | null;
  source_url: string | null;
  external_id: string | null;
  content_type: string | null;
  original_filename: string | null;
  created_at: string;
  content_path: string;
};

export function apiBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(
    /\/$/,
    "",
  );
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}${path}`, {
      ...init,
      cache: "no-store",
    });
  } catch {
    throw new Error(
      `Cannot reach API at ${apiBaseUrl()}. Is uvicorn running?`,
    );
  }
  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = (await response.json()) as { detail?: unknown };
      if (typeof body.detail === "string") detail = body.detail;
    } catch {
      // ignore non-JSON errors
    }
    throw new Error(detail || `Request failed (${response.status})`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export function listBoards(): Promise<Board[]> {
  return request<Board[]>("/boards");
}

export function createBoard(payload: {
  name: string;
  description?: string;
}): Promise<Board> {
  return request<Board>("/boards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function getBoard(boardId: string): Promise<Board> {
  return request<Board>(`/boards/${boardId}`);
}

export function updateBoard(
  boardId: string,
  payload: { name?: string; description?: string | null },
): Promise<Board> {
  return request<Board>(`/boards/${boardId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function deleteBoard(boardId: string): Promise<void> {
  return request<void>(`/boards/${boardId}`, { method: "DELETE" });
}

export function listImages(boardId: string): Promise<ReferenceImage[]> {
  return request<ReferenceImage[]>(`/boards/${boardId}/images`);
}

export async function uploadImage(
  boardId: string,
  file: File,
): Promise<ReferenceImage> {
  const form = new FormData();
  form.append("file", file);
  return request<ReferenceImage>(`/boards/${boardId}/images`, {
    method: "POST",
    body: form,
  });
}

export function deleteImage(boardId: string, imageId: string): Promise<void> {
  return request<void>(`/boards/${boardId}/images/${imageId}`, {
    method: "DELETE",
  });
}

export function imageContentUrl(contentPath: string): string {
  return `${apiBaseUrl()}${contentPath}`;
}

export type QueueImage = {
  id: string;
  image_id: string;
  order_number: number;
  status: string;
  content_path: string;
  original_filename: string | null;
};

export type PracticeSession = {
  id: string;
  board_id: string;
  status: string;
  duration_per_image_seconds: number;
  image_count: number;
  started_at: string;
  finished_at: string | null;
  total_practice_seconds: number;
  current_order: number | null;
  completed_count: number;
  skipped_count: number;
  pending_count: number;
  current_image: QueueImage | null;
  queue: QueueImage[];
};

export type ResetProgressResult = {
  board_id: string;
  reset_count: number;
};

export function createPracticeSession(payload: {
  board_id: string;
  duration_per_image_seconds: number;
  image_count: number;
}): Promise<PracticeSession> {
  return request<PracticeSession>("/practice/sessions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function getPracticeSession(sessionId: string): Promise<PracticeSession> {
  return request<PracticeSession>(`/practice/sessions/${sessionId}`);
}

export function pausePracticeSession(
  sessionId: string,
): Promise<PracticeSession> {
  return request<PracticeSession>(`/practice/sessions/${sessionId}/pause`, {
    method: "POST",
  });
}

export function resumePracticeSession(
  sessionId: string,
): Promise<PracticeSession> {
  return request<PracticeSession>(`/practice/sessions/${sessionId}/resume`, {
    method: "POST",
  });
}

export function completePracticeImage(
  sessionId: string,
  elapsed_seconds: number,
): Promise<PracticeSession> {
  return request<PracticeSession>(`/practice/sessions/${sessionId}/complete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ elapsed_seconds }),
  });
}

export function skipPracticeImage(
  sessionId: string,
  elapsed_seconds: number,
): Promise<PracticeSession> {
  return request<PracticeSession>(`/practice/sessions/${sessionId}/skip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ elapsed_seconds }),
  });
}

export function finishPracticeSession(
  sessionId: string,
): Promise<PracticeSession> {
  return request<PracticeSession>(`/practice/sessions/${sessionId}/finish`, {
    method: "POST",
  });
}

export function resetBoardProgress(
  boardId: string,
): Promise<ResetProgressResult> {
  return request<ResetProgressResult>(`/boards/${boardId}/reset-progress`, {
    method: "POST",
  });
}
