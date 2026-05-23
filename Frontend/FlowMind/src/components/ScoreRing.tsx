import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";

import { colors } from "@/theme/colors";

interface Props {
  score: number;
  delta?: number;
  grade?: string;
  size?: number;
}

export function ScoreRing({ score, delta = 0, grade, size = 140 }: Props) {
  const stroke = 12;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const ringColor = score >= 70 ? colors.good : score >= 50 ? colors.warn : colors.danger;

  return (
    <View style={{ alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.surfaceMuted}
          strokeWidth={stroke}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * pct} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          fill="none"
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.score}>{score}</Text>
        {grade ? <Text style={[styles.grade, { color: ringColor }]}>{grade}</Text> : null}
        {delta !== 0 ? (
          <Text style={[styles.delta, { color: delta > 0 ? colors.good : colors.danger }]}>
            {delta > 0 ? "+" : ""}
            {delta} this week
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  score: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "700",
  },
  grade: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  delta: {
    fontSize: 11,
    marginTop: 2,
  },
});
