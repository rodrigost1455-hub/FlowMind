// Dark-first palette tuned to feel calm under a wallet-style UI.
export const colors = {
  bg: "#0B0F1A",
  bgElevated: "#141A2A",
  surface: "#1B2236",
  surfaceMuted: "#222B43",
  border: "#2B3552",
  text: "#F4F6FB",
  textMuted: "#A6B0CC",
  textDim: "#717B96",

  brand: "#10D9A3",
  brandSoft: "rgba(16, 217, 163, 0.15)",
  accent: "#4F7CFF",

  good: "#10D9A3",
  goodSoft: "rgba(16, 217, 163, 0.15)",
  warn: "#FFB547",
  warnSoft: "rgba(255, 181, 71, 0.15)",
  info: "#4F7CFF",
  infoSoft: "rgba(79, 124, 255, 0.15)",
  danger: "#FF6B7A",
  dangerSoft: "rgba(255, 107, 122, 0.15)",
} as const;

export type ToneKey = "good" | "warn" | "info";

export function toneColors(tone: ToneKey) {
  if (tone === "good") return { fg: colors.good, bg: colors.goodSoft };
  if (tone === "warn") return { fg: colors.warn, bg: colors.warnSoft };
  return { fg: colors.info, bg: colors.infoSoft };
}
