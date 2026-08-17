import React from "react";
import { cn } from "@/lib/utils";
import { AGING } from "@/constants/testIds";

/**
 * AgingCell — dua angka umur yang menentukan urgensi (blueprint IA V2 §2.5):
 *   • **umur total** sejak objek masuk (mis. lead dibuat),
 *   • **umur tahap** sejak objek masuk tahap sekarang.
 *
 * Warna BUKAN satu-satunya penanda (aturan aksesibilitas + gate `verify_ui_surfaces`):
 * selalu ada teks statusnya ("dalam SLA" / "lewat SLA" / "lewat 2× SLA").
 */
const fmt = (hours) => {
  if (hours === null || hours === undefined) return "-";
  const h = Number(hours);
  if (!Number.isFinite(h)) return "-";
  if (h < 1) return `${Math.max(1, Math.round(h * 60))}m`;
  if (h < 48) return `${Math.round(h)}j`;
  const days = Math.floor(h / 24);
  const rest = Math.round(h % 24);
  return rest ? `${days}h ${rest}j` : `${days}h`;
};

export default function AgingCell({ ageHours, stageAgeHours, slaHours = 72, className }) {
  const stage = Number(stageAgeHours ?? ageHours ?? 0);
  const level = stage > slaHours * 2 ? "over2" : stage > slaHours ? "over" : "ok";
  const tone = {
    ok: "text-foreground",
    over: "text-amber-700",
    over2: "text-rose-700",
  }[level];
  const note = { ok: "dalam SLA", over: "lewat SLA", over2: "lewat 2× SLA" }[level];
  const title = `Umur total ${fmt(ageHours)} · umur tahap ${fmt(stage)} · SLA ${slaHours} jam`;

  return (
    <div data-testid={AGING.cell} data-aging-level={level} title={title}
      className={cn("leading-tight", className)}>
      <span data-testid={AGING.total} className="block text-sm tabular-nums">
        {fmt(ageHours)}
      </span>
      <span data-testid={AGING.stage}
        className={cn("block text-xs tabular-nums", tone)}>
        tahap {fmt(stage)} · {note}
      </span>
    </div>
  );
}
