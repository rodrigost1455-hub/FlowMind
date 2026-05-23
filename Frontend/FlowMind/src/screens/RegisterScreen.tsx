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

export function RegisterScreen({ navigation }: { navigation: AuthStackNavProp<"Register"> }) {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim().toLowerCase(), password, fullName.trim() || "Friend");
    } catch (e) {
      setError(asMessage(e, "Could not register"));
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
          <Text style={styles.brand}>Create your account</Text>
          <Text style={styles.subtitle}>It takes about 30 seconds.</Text>

          <View style={styles.form}>
            <Input label="Full name" value={fullName} onChangeText={setFullName} placeholder="Alex Lee" />
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
              placeholder="At least 8 characters"
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button label="Create account" onPress={onSubmit} loading={loading} />

            <Pressable onPress={() => navigation.goBack()} style={styles.link}>
              <Text style={styles.linkText}>
                Already have one? <Text style={{ color: colors.brand }}>Sign in</Text>
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
  content: { flexGrow: 1, padding: spacing.xl, justifyContent: "center" },
  brand: { color: colors.text, fontSize: 28, fontWeight: "800", textAlign: "center" },
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },
  form: { gap: spacing.xs },
  error: { color: colors.danger, marginBottom: spacing.sm, fontSize: 13 },
  link: { marginTop: spacing.lg, alignItems: "center" },
  linkText: { color: colors.textMuted, fontSize: 14 },
});
