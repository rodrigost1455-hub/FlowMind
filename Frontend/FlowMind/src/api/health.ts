import { api } from "./client";
import type { FinancialHealthResponse } from "./types";

export const healthApi = {
  score: () => api.get<FinancialHealthResponse>("/financial-health/score").then((r) => r.data),
  history: () =>
    api
      .get<{ score: number; delta: number; date: string }[]>("/financial-health/history")
      .then((r) => r.data),
};
