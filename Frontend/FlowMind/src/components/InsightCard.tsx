import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Insight } from "@/api/types";
import { colors, toneColors } from "@/theme/colors";
import { radius, spacing } from "@/theme/spacing";

interface Props {
  insight: Insight;
  onDismiss?: (id: string) => void;
  onPress?: (id: string) => void;
}

export function InsightCard({ insight, onDismiss, onPress }: Props) {
  const tone = toneColors(insight.tone);
  return (
    <View style={styles.card}>
      <View style={[styles.tag, { backgroundColor: tone.bg }]}>
        <Text style={[styles.tagText, { color: tone.fg }]}>
          {insight.tone.toUpperCase()} · {Math.round(insight.confidence * 100)}%
        </Text>
      </View>
      <Text style={styles.title}>{insight.title}</Text>
      <Text style={styles.body}>{insight.body}</Text>
      <View style={styles.actions}>
        {insight.action_label && onPress ? (
          <Pressable onPress={() => onPress(insight.id)}>
            <Text style={[styles.action, { color: tone.fg }]}>{insight.action_label} ›</Text>
          </Pressable>
        ) : (
          <View />
        )}
        {onDismiss ? (
          <Pressable onPress={() => onDismiss(insight.id)}>
            <Text style={styles.dismiss}>Dismiss</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tag: {
    alignSelf: "flex-start",
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.sm,
  },
  tagText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  title: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: spacing.xs,
  },
  body: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
  },
  action: {
    fontSize: 13,
    fontWeight: "600",
  },
  dismiss: {
    color: colors.textDim,
    fontSize: 13,
  },
});
