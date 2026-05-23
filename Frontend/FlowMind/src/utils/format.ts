export function formatCurrency(value: number, withSign = false): string {
  const sign = value < 0 ? "-" : withSign ? "+" : "";
  const abs = Math.abs(value);
  return `${sign}$${abs.toFixed(abs >= 1000 ? 0 : 2)}`;
}

export function formatPercent(value: number, digits = 0): string {
  return `${value.toFixed(digits)}%`;
}

const DAY = 1000 * 60 * 60 * 24;

export function relativeDay(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffDays = Math.floor((now - then) / DAY);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}
