import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { asMessage } from "@/api/client";
import { expensesApi } from "@/api/expenses";
import type { Expense } from "@/api/types";
import { ExpenseRow } from "@/components/ExpenseRow";
import { CATEGORIES } from "@/data";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

import { AddExpenseModal } from "./AddExpenseModal";

export function ExpensesScreen() {
  const [items, setItems] = useState<Expense[]>([]);
  const [filter, setFilter] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const page = await expensesApi.list({ category_slug: filter ?? undefined, size: 50 });
      setItems(page.items);
    } catch (e) {
      setError(asMessage(e, "Could not load expenses"));
    }
  }, [filter]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, [load]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  const onCreated = useCallback(async () => {
    setAdding(false);
    await load();
  }, [load]);

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Expenses</Text>
        <Pressable onPress={() => setAdding(true)} style={styles.add}>
          <Text style={styles.addText}>+ Add</Text>
        </Pressable>
      </View>

      <FlatList
        horizontal
        data={[null, ...CATEGORIES.filter((c) => !c.isIncome)]}
        keyExtractor={(c) => c?.slug ?? "all"}
        contentContainerStyle={styles.filters}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => {
          const active = filter === (item?.slug ?? null);
          return (
            <Pressable
              onPress={() => setFilter(item?.slug ?? null)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {item ? `${item.icon} ${item.label}` : "All"}
              </Text>
            </Pressable>
          );
        }}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      {loading ? (
        <ActivityIndicator color={colors.brand} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(e) => e.id}
          contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}
          renderItem={({ item }) => <ExpenseRow expense={item} />}
          refreshControl={
            <RefreshControl tintColor={colors.brand} refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>No expenses yet</Text>
              <Text style={styles.emptyBody}>
                Tap + Add to log your first transaction. Mood + category = insights later.
              </Text>
            </View>
          }
        />
      )}

      <AddExpenseModal visible={adding} onClose={() => setAdding(false)} onCreated={onCreated} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: { color: colors.text, fontSize: 26, fontWeight: "800" },
  add: {
    backgroundColor: colors.brand,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  addText: { color: "#06121C", fontWeight: "700" },
  filters: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, gap: spacing.sm },
  chip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  chipActive: { backgroundColor: colors.brandSoft, borderColor: colors.brand },
  chipText: { color: colors.textMuted, fontSize: 13 },
  chipTextActive: { color: colors.brand, fontWeight: "600" },
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
    margin: spacing.lg,
    backgroundColor: colors.dangerSoft,
    padding: spacing.md,
    borderRadius: radius.md,
  },
});
