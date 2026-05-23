// Types mirroring backend Pydantic schemas. Kept hand-written rather
// than generated so the surface stays minimal — only what the MVP uses.

export type EmotionalState =
  | "happy"
  | "neutral"
  | "stressed"
  | "bored"
  | "sad"
  | "excited";

export type PaymentMethod =
  | "card"
  | "cash"
  | "transfer"
  | "wallet"
  | "direct_deposit";

export type InsightTone = "good" | "warn" | "info";

export type BehaviorClass =
  | "impulsive"
  | "stable"
  | "conservative"
  | "high_risk";

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface UserPublic {
  id: string;
  email: string;
  full_name: string;
  role: "user" | "admin";
  onboarding_completed: boolean;
  monthly_income: number;
  weekly_budget: number;
  xp: number;
  level: number;
  streak_days: number;
  created_at: string;
}

export interface OnboardingStatus {
  onboarding_completed: boolean;
  monthly_income: number;
  weekly_budget: number;
  has_expenses: boolean;
}

export interface Expense {
  id: string;
  amount: number;
  category_slug: string;
  occurred_at: string;
  merchant: string;
  notes?: string | null;
  payment_method: PaymentMethod;
  emotional_state?: EmotionalState | null;
  tags: string[];
  location?: string | null;
  is_recurring: boolean;
  is_anomaly: boolean;
  created_at: string;
}

export interface ExpenseCreate {
  amount: number;
  category_slug: string;
  occurred_at: string;
  merchant: string;
  payment_method: PaymentMethod;
  emotional_state?: EmotionalState | null;
  notes?: string | null;
  tags?: string[];
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface CategoryBreakdownItem {
  category_slug: string;
  amount: number;
  pct: number;
}

export interface PeriodAnalytics {
  period: "week" | "month";
  start: string;
  end: string;
  total_spent: number;
  total_income: number;
  net_saved: number;
  transaction_count: number;
  avg_transaction: number;
  impulse_pct: number;
  vs_previous_pct: number;
  category_breakdown: CategoryBreakdownItem[];
  daily?: { date: string; amount: number }[];
}

export interface AnalyticsOverview {
  balance: number;
  income: number;
  spent_this_week: number;
  weekly_budget: number;
  budget_used_pct: number;
  week: PeriodAnalytics;
  month: PeriodAnalytics;
  savings_trend: { week: string; net: number; cumulative: number }[];
  heatmap: { weekday: number; hour: number; intensity: number }[];
}

export interface ScoreComponents {
  spending_stability: number;
  savings_consistency: number;
  debt_ratio_score: number;
  impulse_control: number;
  recurring_load: number;
  trend_score: number;
}

export interface FinancialHealthResponse {
  score: number;
  delta: number;
  grade: "A" | "B" | "C" | "D" | "F";
  components: ScoreComponents;
  warnings: string[];
  strengths: string[];
  recommendations: string[];
  computed_at: string;
}

export interface Insight {
  id: string;
  tone: InsightTone;
  title: string;
  body: string;
  action_label?: string | null;
  source: string;
  confidence: number;
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
}

export interface WeeklySummary {
  id: string;
  week_start: string;
  headline: string;
  narrative: string;
  bullet_points: string[];
  total_spent: number;
  total_income: number;
  net_saved: number;
  vs_prev_week_pct: number;
}

export interface SpendingForecast {
  weekly_spending: number;
  monthly_spending: number;
  overspend_probability: number;
  confidence: number;
  model_version: string;
}

export interface BehaviorProfile {
  behavior_class: BehaviorClass;
  confidence: number;
  class_probabilities: Record<BehaviorClass, number>;
  drivers: string[];
  model_version: string;
}

export interface SavingsForecastResult {
  projected_savings_30d: number;
  projected_savings_90d: number;
  decline_risk: number;
  trajectory: "healthy" | "flat" | "declining";
  model_version: string;
}

export interface AnomalyResult {
  expense_id: string;
  merchant: string;
  amount: number;
  occurred_at: string;
  anomaly_score: number;
  reason: string;
}

export interface PredictionBundle {
  spending: SpendingForecast;
  behavior: BehaviorProfile;
  savings: SavingsForecastResult;
  anomalies: AnomalyResult[];
}
