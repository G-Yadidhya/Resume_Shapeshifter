import { TailoringRunSchema, type TailoringRun } from "@/lib/schemas";

export const SESSION_STORAGE_KEY = "tailoringRun:v1";

export function saveTailoringRun(run: TailoringRun): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(run));
  } catch {
    // Quota exceeded or private mode — fall back to in-memory only
  }
}

export function loadTailoringRun(): TailoringRun | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return TailoringRunSchema.parse(JSON.parse(raw));
  } catch {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

export function clearTailoringRun(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
}
