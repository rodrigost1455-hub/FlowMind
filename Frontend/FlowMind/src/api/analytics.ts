import { api } from "./client";
import type { AnalyticsOverview, PeriodAnalytics } from "./types";

export const analyticsApi = {
  overview: () => api.get<AnalyticsOverview>("/analytics/overview").then((r) => r.data),
  weekly: () => api.get<PeriodAnalytics>("/analytics/weekly").then((r) => r.data),
  monthly: () => api.get<PeriodAnalytics>("/analytics/monthly").then((r) => r.data),
};
