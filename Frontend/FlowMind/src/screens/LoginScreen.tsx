import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { asMessage } from "@/api/client";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useAuth } from "@/contexts/AuthContext";
import { colors } from "@/theme/colors";
import { spacing } from "@/theme/spacing";

import type { AuthStackNavProp } from "@/navigation/types";

export function LoginScreen({ navigation }: { navigation: AuthStackNavProp<"Login"> }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("demo@flowmind.app");
  const [password, setPassword] = useState("demo12345");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (e) {
      setError(asMessage(e, "Could not sign in"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.brand}>FlowMind</Text>
          <Text style={styles.subtitle}>Money that feels good.</Text>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@flowmind.app"
            />
            <Input
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="••••••••"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button label="Sign in" onPress={onSubmit} loading={loading} />

            <Pressable onPress={() => navigation.navigate("Register")} style={styles.link}>
              <Text style={styles.linkText}>
                New here? <Text style={{ color: colors.brand }}>Create an account</Text>
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: {
    flexGrow: 1,
    padding: spacing.xl,
    justifyContent: "center",
  },
  brand: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
  form: { gap: spacing.xs },
  error: {
    color: colors.danger,
    marginBottom: spacing.sm,
    fontSize: 13,
  },
  link: { marginTop: spacing.lg, alignItems: "center" },
  linkText: { color: colors.textMuted, fontSize: 14 },
});
