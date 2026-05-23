import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { analyticsApi } from "@/api/analytics";
import { asMessage } from "@/api/client";
import { healthApi } from "@/api/health";
import { insightsApi } from "@/api/insights";
import { Card } from "@/components/Card";
import { InsightCard } from "@/components/InsightCard";
import { ScoreRing } from "@/components/ScoreRing";
import { useAuth } from "@/contexts/AuthContext";
import { categoryFor } from "@/data";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";
import { formatCurrency, formatPercent } from "@/utils/format";
import type {
  AnalyticsOverview,
  FinancialHealthResponse,
  Insight,
} from "@/api/types";

export function DashboardScreen() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [health, setHealth] = useState<FinancialHealthResponse | null>(null);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [ov, hs, ins] = await Promise.all([
        analyticsApi.overview(),
        healthApi.score(),
        insightsApi.list(),
      ]);
      setOverview(ov);
      setHealth(hs);
      setInsights(ins);
    } catch (e) {
      setError(asMessage(e, "Could not load dashboard"));
    }
  }, []);

  useEffect(() => {
    (async () => {
      await load();
      setLoading(false);
    })();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </SafeAreaView>
    );
  }

  const budgetPct = overview ? Math.min(100, overview.budget_used_pct) : 0;
  const budgetBarColor =
    budgetPct < 75 ? colors.brand : budgetPct < 100 ? colors.warn : colors.danger;
  const topCategories = overview?.week.category_breakdown.slice(0, 3) ?? [];

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl tintColor={colors.brand} refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.hello}>Hey {user?.full_name?.split(" ")[0] ?? "there"} 👋</Text>
        <Text style={styles.subline}>Here's where you stand today.</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Card style={{ marginTop: spacing.lg, alignItems: "center", paddingVertical: spacing.xl }}>
          <Text style={styles.cardLabel}>FINANCIAL HEALTH</Text>
          <View style={{ marginVertical: spacing.md }}>
            <ScoreRing score={health?.score ?? 0} delta={health?.delta ?? 0} grade={health?.grade} />
          </View>
          {health?.recommendations?.[0] ? (
            <Text style={styles.tip}>{health.recommendations[0]}</Text>
          ) : null}
        </Card>

        {overview ? (
          <View style={styles.row}>
            <Card style={{ flex: 1, marginRight: spacing.sm }}>
              <Text style={styles.cardLabel}>BALANCE</Text>
              <Text style={styles.bigNumber}>{formatCurrency(overview.balance)}</Text>
              <Text style={styles.cardSub}>Net all-time</Text>
            </Card>
            <Card style={{ flex: 1, marginLeft: spacing.sm }}>
              <Text style={styles.cardLabel}>THIS WEEK</Text>
              <Text style={styles.bigNumber}>{formatCurrency(overview.spent_this_week)}</Text>
              <Text style={styles.cardSub}>
                {overview.week.transaction_count} transactions
              </Text>
            </Card>
          </View>
        ) : null}

        {overview && overview.weekly_budget > 0 ? (
          <Card style={{ marginTop: spacing.md }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={styles.cardLabel}>WEEKLY BUDGET</Text>
              <Text style={[styles.cardLabel, { color: budgetBarColor }]}>
                {formatPercent(overview.budget_used_pct, 0)}
              </Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${budgetPct}%`, backgroundColor: budgetBarColor },
                ]}
              />
            </View>
            <Text style={styles.cardSub}>
              {formatCurrency(overview.spent_this_week)} of {formatCurrency(overview.weekly_budget)}
            </Text>
          </Card>
        ) : null}

        {topCategories.length > 0 ? (
          <Card style={{ marginTop: spacing.md }}>
            <Text style={styles.cardLabel}>TOP CATEGORIES THIS WEEK</Text>
            <View style={{ marginTop: spacing.md, gap: spacing.sm }}>
              {topCategories.map((c) => {
                const cat = categoryFor(c.category_slug);
                return (
                  <View key={c.category_slug} style={styles.catRow}>
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                    <Text style={styles.catLabel}>{cat.label}</Text>
                    <Text style={styles.catAmount}>{formatCurrency(c.amount)}</Text>
                  </View>
                );
              })}
            </View>
          </Card>
        ) : null}

        {insights.length > 0 ? (
          <View style={{ marginTop: spacing.xl }}>
            <Text style={styles.section}>Top insights</Text>
            {insights.slice(0, 3).map((i) => (
              <InsightCard key={i.id} insight={i} />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl * 2 },
  hello: { color: colors.text, fontSize: 26, fontWeight: "800" },
  subline: { color: colors.textMuted, fontSize: 14, marginTop: spacing.xs },
  error: {
    color: colors.danger,
    marginTop: spacing.md,
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  cardLabel: { color: colors.textDim, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  bigNumber: { color: colors.text, fontSize: 24, fontWeight: "800", marginTop: spacing.sm },
  cardSub: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs },
  tip: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: "center",
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  row: { flexDirection: "row", marginTop: spacing.md },
  barTrack: {
    height: 8,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.pill,
    marginTop: spacing.md,
    overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: radius.pill },
  section: { color: colors.text, fontSize: 18, fontWeight: "700", marginBottom: spacing.md },
  catRow: { flexDirection: "row", alignItems: "center" },
  catIcon: { fontSize: 18, width: 28 },
  catLabel: { color: colors.text, flex: 1, fontSize: 14 },
  catAmount: { color: colors.text, fontSize: 14, fontWeight: "600" },
});
