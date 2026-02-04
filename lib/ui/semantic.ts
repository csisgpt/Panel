export type Tone = "success" | "warn" | "danger" | "info" | "neutral";

const toneMap: Record<Tone, { text: string; bg: string; border: string }> = {
  success: {
    text: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
  },
  warn: {
    text: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
  },
  danger: {
    text: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
  },
  info: {
    text: "text-sky-600",
    bg: "bg-sky-50",
    border: "border-sky-200",
  },
  neutral: {
    text: "text-muted-foreground",
    bg: "bg-muted/40",
    border: "border-border/60",
  },
};

export function toneClass(tone: Tone) {
  const style = toneMap[tone];
  return `${style.text} ${style.bg} ${style.border}`;
}
