import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { authApi } from "@/api/auth";
import { asMessage } from "@/api/client";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

export function OnboardingScreen() {
  const { refresh } = useAuth();
  const [income, setIncome] = useState("");
  const [budget, setBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    const monthlyIncome = Number(income);
    const weeklyBudget = Number(budget);
    if (!Number.isFinite(monthlyIncome) || monthlyIncome < 0) {
      setError("Enter a valid monthly income");
      return;
    }
    if (!Number.isFinite(weeklyBudget) || weeklyBudget < 0) {
      setError("Enter a valid weekly budget");
      return;
    }
    setLoading(true);
    try {
      await authApi.completeOnboarding(monthlyIncome, weeklyBudget);
      await refresh();
    } catch (e) {
      setError(asMessage(e, "Could not save onboarding"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Set your baseline</Text>
        <Text style={styles.subtitle}>
          We use these to ground every insight and budget signal. You can change them anytime.
        </Text>

        <View style={styles.form}>
          <Input
            label="Monthly income (after tax)"
            value={income}
            onChangeText={setIncome}
            keyboardType="decimal-pad"
            placeholder="4000"
          />
          <Input
            label="Weekly spending budget"
            value={budget}
            onChangeText={setBudget}
            keyboardType="decimal-pad"
            placeholder="350"
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button label="Continue" onPress={onSubmit} loading={loading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flexGrow: 1, padding: spacing.xl, justifyContent: "center" },
  title: { color: colors.text, fontSize: 28, fontWeight: "800" },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
    lineHeight: 22,
  },
  form: { gap: spacing.xs },
  error: { color: colors.danger, marginBottom: spacing.sm, fontSize: 13 },
});
