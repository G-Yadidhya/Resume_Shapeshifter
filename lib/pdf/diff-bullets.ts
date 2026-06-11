import type { TailoredBullet } from "@/lib/schemas";

export function diffBullets(bullets: TailoredBullet[]) {
  return bullets.map((b) => ({
    original: b.original ?? "",
    tailored: b.tailored ?? "",
    changed: (b.original ?? "").trim() !== (b.tailored ?? "").trim(),
  }));
}

export default diffBullets;
