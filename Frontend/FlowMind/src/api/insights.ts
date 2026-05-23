import { api } from "./client";
import type { Insight, WeeklySummary } from "./types";

export const insightsApi = {
  list: () => api.get<Insight[]>("/insights").then((r) => r.data),
  generate: () => api.post<Insight[]>("/insights/generate").then((r) => r.data),
  markRead: (id: string) => api.post<Insight>(`/insights/${id}/read`).then((r) => r.data),
  dismiss: (id: string) => api.post<Insight>(`/insights/${id}/dismiss`).then((r) => r.data),
  latestSummary: () =>
    api.get<WeeklySummary | null>("/insights/weekly-summary").then((r) => r.data),
  generateSummary: () =>
    api.post<WeeklySummary>("/insights/weekly-summary/generate").then((r) => r.data),
};
