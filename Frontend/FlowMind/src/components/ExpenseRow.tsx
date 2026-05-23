import { Pressable, StyleSheet, Text, View } from "react-native";

import { categoryFor } from "@/data";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";
import { formatCurrency, relativeDay } from "@/utils/format";
import type { Expense } from "@/api/types";

interface Props {
  expense: Expense;
  onPress?: () => void;
}

export function ExpenseRow({ expense, onPress }: Props) {
  const cat = categoryFor(expense.category_slug);
  const isIncome = expense.amount > 0;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { opacity: 0.7 }]}
    >
      <View style={[styles.icon, { backgroundColor: cat.color + "33" }]}>
        <Text style={{ fontSize: 20 }}>{cat.icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.merchant} numberOfLines={1}>
          {expense.merchant || cat.label}
        </Text>
        <Text style={styles.meta}>
          {cat.label} · {relativeDay(expense.occurred_at)}
          {expense.is_anomaly ? " · ⚠ anomaly" : ""}
        </Text>
      </View>
      <Text style={[styles.amount, { color: isIncome ? colors.good : colors.text }]}>
        {formatCurrency(expense.amount, true)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  merchant: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "600",
  },
  meta: {
    color: colors.textDim,
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    fontSize: 15,
    fontWeight: "700",
  },
});
