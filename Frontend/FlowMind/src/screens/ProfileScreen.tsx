import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { API_BASE_URL } from "@/api/client";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";
import { formatCurrency } from "@/utils/format";

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  if (!user) return null;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl * 2 }}>
        <Text style={styles.title}>Profile</Text>

        <Card style={{ marginTop: spacing.lg, alignItems: "center" }}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user.full_name || user.email).slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.name}>{user.full_name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </Card>

        <View style={styles.grid}>
          <Card style={styles.tile}>
            <Text style={styles.tileLabel}>LEVEL</Text>
            <Text style={styles.tileValue}>{user.level}</Text>
          </Card>
          <Card style={styles.tile}>
            <Text style={styles.tileLabel}>XP</Text>
            <Text style={styles.tileValue}>{user.xp}</Text>
          </Card>
          <Card style={styles.tile}>
            <Text style={styles.tileLabel}>STREAK</Text>
            <Text style={styles.tileValue}>{user.streak_days}d</Text>
          </Card>
        </View>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.sectionLabel}>BASELINE</Text>
          <View style={styles.kvRow}>
            <Text style={styles.kvKey}>Monthly income</Text>
            <Text style={styles.kvValue}>{formatCurrency(user.monthly_income)}</Text>
          </View>
          <View style={styles.kvRow}>
            <Text style={styles.kvKey}>Weekly budget</Text>
            <Text style={styles.kvValue}>{formatCurrency(user.weekly_budget)}</Text>
          </View>
        </Card>

        <Card style={{ marginTop: spacing.md }}>
          <Text style={styles.sectionLabel}>CONNECTION</Text>
          <Text style={styles.kvKey}>{API_BASE_URL}</Text>
        </Card>

        <Button label="Sign out" variant="danger" onPress={signOut} style={{ marginTop: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.text, fontSize: 26, fontWeight: "800" },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.brandSoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  avatarText: { color: colors.brand, fontSize: 28, fontWeight: "800" },
  name: { color: colors.text, fontSize: 20, fontWeight: "700" },
  email: { color: colors.textMuted, fontSize: 14, marginTop: spacing.xs },
  grid: { flexDirection: "row", marginTop: spacing.md, gap: spacing.sm },
  tile: { flex: 1, alignItems: "center" },
  tileLabel: { color: colors.textDim, fontSize: 11, fontWeight: "700", letterSpacing: 1 },
  tileValue: { color: colors.text, fontSize: 24, fontWeight: "800", marginTop: spacing.sm },
  sectionLabel: {
    color: colors.textDim,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  kvRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  kvKey: { color: colors.textMuted, fontSize: 14 },
  kvValue: { color: colors.text, fontSize: 14, fontWeight: "600" },
});
