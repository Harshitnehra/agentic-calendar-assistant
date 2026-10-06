const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export async function apiFetch<T>(
  path: string,
  options: {
    method?: string;
    token?: string | null;
    body?: unknown;
  } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const contentType = res.headers.get("content-type") ?? "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Expected a JSON response from ${path}, but received ${contentType || "an unknown content type"}`,
    );
  }

  const data = (await res.json()) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Request failed");

  return data;
}
