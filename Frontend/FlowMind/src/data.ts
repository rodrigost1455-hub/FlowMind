// Mirror of Backend/app/models/category.py DEFAULT_CATEGORIES.
// Kept here so the picker UI can render without a /categories endpoint
// (the backend doesn't expose one yet).
export interface CategoryDef {
  slug: string;
  label: string;
  icon: string;
  color: string;
  isIncome: boolean;
}

export const CATEGORIES: CategoryDef[] = [
  { slug: "food", label: "Food", icon: "🍜", color: "#FF8A65", isIncome: false },
  { slug: "coffee", label: "Coffee", icon: "☕", color: "#B97A56", isIncome: false },
  { slug: "transport", label: "Transport", icon: "🚇", color: "#4F7CFF", isIncome: false },
  { slug: "shopping", label: "Shopping", icon: "🛍", color: "#A855F7", isIncome: false },
  { slug: "rent", label: "Rent", icon: "🏠", color: "#34D399", isIncome: false },
  { slug: "health", label: "Health", icon: "✚", color: "#FF6B7A", isIncome: false },
  { slug: "fun", label: "Fun", icon: "🎧", color: "#FF5BA8", isIncome: false },
  { slug: "bills", label: "Bills", icon: "⚡", color: "#FFB547", isIncome: false },
  { slug: "travel", label: "Travel", icon: "✈", color: "#22D3EE", isIncome: false },
  { slug: "income", label: "Income", icon: "↓", color: "#10D9A3", isIncome: true },
];

export const CATEGORY_BY_SLUG: Record<string, CategoryDef> = Object.fromEntries(
  CATEGORIES.map((c) => [c.slug, c]),
);

export function categoryFor(slug: string | undefined | null): CategoryDef {
  if (!slug) return CATEGORIES[0];
  return CATEGORY_BY_SLUG[slug] ?? { slug, label: slug, icon: "•", color: "#888", isIncome: false };
}
