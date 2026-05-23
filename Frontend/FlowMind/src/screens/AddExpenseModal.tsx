import { useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import { asMessage } from "@/api/client";
import { expensesApi } from "@/api/expenses";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { CATEGORIES } from "@/data";
import { colors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";
import type { EmotionalState } from "@/api/types";

const MOODS: EmotionalState[] = ["happy", "neutral", "stressed", "bored", "sad", "excited"];

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function AddExpenseModal({ visible, onClose, onCreated }: Props) {
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [categorySlug, setCategorySlug] = useState("food");
  const [mood, setMood] = useState<EmotionalState | null>("neutral");
  const [isIncome, setIsIncome] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setAmount("");
    setMerchant("");
    setCategorySlug("food");
    setMood("neutral");
    setIsIncome(false);
    setError(null);
  };

  const submit = async () => {
    setError(null);
    const numeric = Number(amount);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      setError("Enter a positive amount");
      return;
    }
    setLoading(true);
    try {
      await expensesApi.create({
        amount: isIncome ? numeric : -numeric,
        category_slug: isIncome ? "income" : categorySlug,
        occurred_at: new Date().toISOString(),
        merchant: merchant.trim() || (isIncome ? "Income" : "Unknown"),
        payment_method: isIncome ? "direct_deposit" : "card",
        emotional_state: isIncome ? null : mood,
      });
      reset();
      onCreated();
    } catch (e) {
      setError(asMessage(e, "Could not save"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.backdrop}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <ScrollView contentContainerStyle={{ padding: spacing.lg }} keyboardShouldPersistTaps="handled">
            <Text style={styles.title}>{isIncome ? "Log income" : "New expense"}</Text>

            <View style={styles.toggleRow}>
              <Text style={styles.toggleLabel}>Income instead</Text>
              <Switch
                value={isIncome}
                onValueChange={setIsIncome}
                trackColor={{ false: colors.surfaceMuted, true: colors.brand }}
                thumbColor="#fff"
              />
            </View>

            <Input
              label="Amount"
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="0.00"
              autoFocus
            />
            <Input
              label={isIncome ? "Source" : "Merchant"}
              value={merchant}
              onChangeText={setMerchant}
              placeholder={isIncome ? "Salary, refund..." : "Where did you spend?"}
            />

            {!isIncome ? (
              <>
                <Text style={styles.label}>Category</Text>
                <View style={styles.chipWrap}>
                  {CATEGORIES.filter((c) => !c.isIncome).map((c) => {
                    const active = c.slug === categorySlug;
                    return (
                      <Pressable
                        key={c.slug}
                        onPress={() => setCategorySlug(c.slug)}
                        style={[styles.chip, active && { borderColor: c.color, backgroundColor: c.color + "22" }]}
                      >
                        <Text style={[styles.chipText, active && { color: colors.text }]}>
                          {c.icon} {c.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                <Text style={[styles.label, { marginTop: spacing.lg }]}>How did you feel?</Text>
                <View style={styles.chipWrap}>
                  {MOODS.map((m) => {
                    const active = mood === m;
                    return (
                      <Pressable
                        key={m}
                        onPress={() => setMood(active ? null : m)}
                        style={[styles.chip, active && styles.chipActive]}
                      >
                        <Text style={[styles.chipText, active && { color: colors.brand }]}>{m}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : null}

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <View style={{ flexDirection: "row", marginTop: spacing.xl, gap: spacing.md }}>
              <Button label="Cancel" variant="ghost" onPress={onClose} style={{ flex: 1 }} />
              <Button label="Save" onPress={submit} loading={loading} style={{ flex: 1 }} />
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  sheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: "92%",
  },
  handle: {
    width: 44,
    height: 4,
    backgroundColor: colors.border,
    alignSelf: "center",
    marginTop: spacing.sm,
    borderRadius: radius.pill,
  },
  title: { color: colors.text, fontSize: 22, fontWeight: "800", marginBottom: spacing.lg },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  toggleLabel: { color: colors.textMuted, fontSize: 14 },
  label: { color: colors.textMuted, fontSize: 13, fontWeight: "600", marginBottom: spacing.sm },
  chipWrap: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { borderColor: colors.brand, backgroundColor: colors.brandSoft },
  chipText: { color: colors.textMuted, fontSize: 13 },
  error: { color: colors.danger, marginTop: spacing.md, fontSize: 13 },
});
