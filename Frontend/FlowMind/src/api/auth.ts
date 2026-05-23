import { api } from "./client";
import type { OnboardingStatus, TokenPair, UserPublic } from "./types";

export const authApi = {
  register: (email: string, password: string, full_name: string) =>
    api.post<TokenPair>("/auth/register", { email, password, full_name }).then((r) => r.data),

  login: (email: string, password: string) =>
    api.post<TokenPair>("/auth/login", { email, password }).then((r) => r.data),

  me: () => api.get<UserPublic>("/auth/me").then((r) => r.data),

  onboardingStatus: () =>
    api.get<OnboardingStatus>("/auth/onboarding-status").then((r) => r.data),

  completeOnboarding: (monthly_income: number, weekly_budget: number) =>
    api
      .post<UserPublic>("/users/me/onboarding", {
        monthly_income,
        weekly_budget,
        onboarding_completed: true,
      })
      .then((r) => r.data),

  updateProfile: (patch: Partial<{ full_name: string; monthly_income: number; weekly_budget: number }>) =>
    api.patch<UserPublic>("/users/me", patch).then((r) => r.data),
};
