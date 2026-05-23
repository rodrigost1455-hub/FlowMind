import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { asMessage } from "@/api/client";
import { insightsApi } from "@/api/insights";
import { Button } from "@/components/Button";
import { InsightCard } from "@/components/InsightCard";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";
import type { Insight, WeeklySummary } from "@/api/types";

export function InsightsScreen() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [list, latest] = await Promise.all([
        insightsApi.list(),
        insightsApi.latestSummary(),
      ]);
      setInsights(list);
      setSummary(latest);
    } catch (e) {
      setError(asMessage(e, "Could not load insights"));
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

  const regenerate = useCallback(async () => {
    setRegenerating(true);
    try {
      const fresh = await insightsApi.generate();
      setInsights(fresh);
    } catch (e) {
      setError(asMessage(e, "Could not regenerate"));
    } finally {
      setRegenerating(false);
    }
  }, []);

  const onDismiss = useCallback(async (id: string) => {
    setInsights((cur) => cur.filter((i) => i.id !== id));
    try {
      await insightsApi.dismiss(id);
    } catch {
      // Best-effort optimistic dismiss; next refresh will reconcile.
    }
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator color={colors.brand} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <FlatList
        data={insights}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}
        refreshControl={
          <RefreshControl tintColor={colors.brand} refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListHeaderComponent={
          <View>
            <Text style={styles.title}>Insights</Text>
            <Text style={styles.subtitle}>Grounded in your actual transactions.</Text>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {summary ? (
              <View style={styles.summary}>
                <Text style={styles.summaryTag}>WEEKLY SUMMARY</Text>
                <Text style={styles.summaryHeadline}>{summary.headline}</Text>
                <Text style={styles.summaryBody}>{summary.narrative}</Text>
                {summary.bullet_points.map((b, idx) => (
                  <Text key={idx} style={styles.bullet}>
                    • {b}
                  </Text>
                ))}
              </View>
            ) : null}

            <Button
              label={regenerating ? "Regenerating..." : "Regenerate insights"}
              onPress={regenerate}
              loading={regenerating}
              variant="ghost"
              style={{ marginVertical: spacing.lg }}
            />
          </View>
        }
        renderItem={({ item }) => <InsightCard insight={item} onDismiss={onDismiss} />}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No insights yet</Text>
            <Text style={styles.emptyBody}>
              Log at least 8 transactions and we'll start surfacing patterns.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" },
  title: { color: colors.text, fontSize: 26, fontWeight: "800" },
  subtitle: { color: colors.textMuted, fontSize: 14, marginTop: spacing.xs, marginBottom: spacing.lg },
  summary: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryTag: {
    color: colors.brand,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  summaryHeadline: { color: colors.text, fontSize: 18, fontWeight: "700" },
  summaryBody: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  bullet: { color: colors.textMuted, fontSize: 13, lineHeight: 20 },
  empty: { padding: spacing.xl, alignItems: "center" },
  emptyTitle: { color: colors.text, fontSize: 18, fontWeight: "700" },
  emptyBody: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  error: {
    color: colors.danger,
    marginVertical: spacing.md,
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
    borderRadius: radius.md,
  },
});
