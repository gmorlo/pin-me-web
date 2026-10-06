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
