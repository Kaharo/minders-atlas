export class ApiError extends Error { constructor(readonly status: number, message: string) { super(message); } }

const qs = (params?: Record<string, string | number | null | undefined>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params ?? {})) if (v != null && v !== '') p.set(k, String(v));
  const s = p.toString();
  return s ? '?' + s : '';
};

export async function request<T>(path: string, opts: { method?: string; body?: unknown; params?: Record<string, string | number | null | undefined> } = {}): Promise<T> {
  const r = await fetch('/api' + path + qs(opts.params), {
    method: opts.method ?? 'GET',
    credentials: 'same-origin',
    headers: opts.body !== undefined ? { 'content-type': 'application/json' } : undefined,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined
  });
  const data = (await r.json().catch(() => ({}))) as { error?: string } & T;
  if (!r.ok) throw new ApiError(r.status, data.error ?? r.statusText);
  return data;
}

export const api = {
  get: <T>(path: string, params?: Record<string, string | number | null | undefined>) => request<T>(path, { params }),
  post: <T>(path: string, body: unknown) => request<T>(path, { method: 'POST', body }),
  put: <T>(path: string, body: unknown) => request<T>(path, { method: 'PUT', body }),
  del: <T>(path: string, params?: Record<string, string | number | null | undefined>) => request<T>(path, { method: 'DELETE', params })
};
