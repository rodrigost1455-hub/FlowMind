import { api } from "./client";
import type { Expense, ExpenseCreate, Page } from "./types";

interface ListOpts {
  page?: number;
  size?: number;
  category_slug?: string;
}

export const expensesApi = {
  list: (opts: ListOpts = {}) =>
    api.get<Page<Expense>>("/expenses", { params: { page: 1, size: 30, ...opts } }).then((r) => r.data),

  byCategory: () =>
    api
      .get<{ category_slug: string; total: number; count: number; avg: number }[]>(
        "/expenses/by-category",
      )
      .then((r) => r.data),

  create: (data: ExpenseCreate) => api.post<Expense>("/expenses", data).then((r) => r.data),

  update: (id: string, patch: Partial<ExpenseCreate>) =>
    api.patch<Expense>(`/expenses/${id}`, patch).then((r) => r.data),

  remove: (id: string) => api.delete(`/expenses/${id}`).then(() => undefined),
};
