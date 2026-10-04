import axios from "axios";

import type { User } from "@/src/app/redux/Resources/userSlice";

/** Shared axios instance for the v2 backend. Cookies carry the session. */
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  withCredentials: true,
});

/** Unwraps the `{ success, data }` envelope every endpoint returns. */
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await api.get(url, { params });
  return res.data.data as T;
}

export async function apiSend<T>(method: "post" | "put" | "patch" | "delete", url: string, body?: unknown): Promise<T> {
  const res = await api.request({ method, url, data: body });
  return res.data?.data as T;
}

/** Errors are plain-text bodies; surface them verbatim when present. */
export function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data;
    if (typeof data === "string" && data.trim() !== "") return data;
    if (data && typeof data === "object" && "message" in data && typeof data.message === "string") {
      return data.message;
    }
    if (err.response?.status === 401) return "Your session has expired. Please log in again.";
    return err.message;
  }
  return err instanceof Error ? err.message : "Something went wrong";
}

export function errorStatus(err: unknown): number | undefined {
  return axios.isAxiosError(err) ? err.response?.status : undefined;
}

/** Normalises the `/user/info` and `/user/login` user payload into the redux shape. */
export function toUser(raw: Record<string, unknown>): User {
  return {
    username: raw.username as string,
    name: (raw.name as string) ?? undefined,
    role: raw.role as string,
    year: raw.year as number,
    gender: raw.gender as string,
    room: raw.room as string,
  };
}

export function homeFor(user: Pick<User, "role">): string {
  return user.role === "ADMIN" ? "/admin" : "/dashboard/jersey";
}
