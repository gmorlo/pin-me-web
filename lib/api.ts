export type BoardPreviewImage = {
  id: string;
  content_path: string;
};

export type Board = {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  image_count: number;
  preview_images: BoardPreviewImage[];
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

export type ImagePage = {
  items: ReferenceImage[];
  total: number;
  limit: number;
  offset: number;
};

export const IMAGE_PAGE_SIZE = 24;

// Proxied to the API by next.config.ts rewrites.
export function apiBaseUrl(): string {
  return "/api";
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}${path}`, {
      ...init,
      cache: "no-store",
      credentials: "include",
    });
  } catch {
    throw new Error("Cannot reach the server. Check your connection and try again.");
  }
  if (!response.ok) {
    let detail = response.statusText;
    try {
      const body = (await response.json()) as { detail?: unknown };
      if (typeof body.detail === "string") detail = body.detail;
    } catch {
      // ignore non-JSON errors
    }
    throw new ApiError(
      response.status,
      detail || `Request failed (${response.status})`,
    );
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  created_at: string;
};

export type AuthStatus = {
  google_configured: boolean;
  dev_bypass: boolean;
};

export function getAuthStatus(): Promise<AuthStatus> {
  return request<AuthStatus>("/auth/status");
}

export function getMe(): Promise<AuthUser> {
  return request<AuthUser>("/auth/me");
}

export function logout(): Promise<void> {
  return request<void>("/auth/logout", { method: "POST" });
}

export function devLogin(email: string): Promise<AuthUser> {
  return request<AuthUser>("/auth/dev-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

export function googleLoginUrl(): string {
  return `${apiBaseUrl()}/auth/google/start`;
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

export function listImages(
  boardId: string,
  opts?: { limit?: number; offset?: number },
): Promise<ImagePage> {
  const limit = opts?.limit ?? IMAGE_PAGE_SIZE;
  const offset = opts?.offset ?? 0;
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  return request<ImagePage>(`/boards/${boardId}/images?${params}`);
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

export type UploadImagesResult = {
  uploaded: ReferenceImage[];
  failures: { name: string; message: string }[];
};

/** Upload many files one-by-one against the existing single-file API. */
export async function uploadImages(
  boardId: string,
  files: File[],
  onProgress?: (done: number, total: number) => void,
): Promise<UploadImagesResult> {
  const uploaded: ReferenceImage[] = [];
  const failures: { name: string; message: string }[] = [];
  const total = files.length;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    try {
      uploaded.push(await uploadImage(boardId, file));
    } catch (err) {
      failures.push({
        name: file.name,
        message: err instanceof Error ? err.message : "Upload failed",
      });
    }
    onProgress?.(i + 1, total);
  }
  return { uploaded, failures };
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
