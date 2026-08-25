import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LockKeyhole, Mail } from "lucide-react-native";
import { apiRequest } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { H2Brand } from "@/components/h2-brand";
import { H2Colors, H2Fonts, H2Radius } from "@/constants/theme";

type LoginResponse = {
  sessionToken?: string;
};

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  async function handleLogin() {
    setError("");
    setLoading(true);

    try {
      const data = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
        }),
      });
      if (data.sessionToken) {
        // Save the token and update the authentication state for the whole app.
        await signIn(data.sessionToken);
      } else {
        setError("Login worked, but no session was returned.");
      }
    } catch {
      setError("Could not sign in. Check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.screen}
      >
        <H2Brand />

        <View style={styles.intro}>
          <Text style={styles.eyebrow}>WELCOME HOME</Text>
          <Text style={styles.title}>Your water system, within reach.</Text>
          <Text style={styles.description}>
            Sign in to monitor flow, manage devices, and protect your home.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email address</Text>
          <View style={styles.inputShell}>
            <Mail color={H2Colors.textMuted} size={18} />
            <TextInput
              autoCapitalize="none"
              autoComplete="email"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor={H2Colors.textMuted}
              style={styles.input}
              value={email}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputShell}>
            <LockKeyhole color={H2Colors.textMuted} size={18} />
            <TextInput
              autoComplete="current-password"
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={H2Colors.textMuted}
              secureTextEntry
              style={styles.input}
              value={password}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable disabled={loading} style={styles.button} onPress={handleLogin}>
            {loading ? (
              <ActivityIndicator color={H2Colors.white} size="small" />
            ) : (
              <Text style={styles.buttonText}>Sign in</Text>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: H2Colors.primary,
    borderRadius: H2Radius.large,
    height: 54,
    justifyContent: "center",
    marginTop: 22,
  },
  buttonText: {
    color: H2Colors.white,
    fontFamily: H2Fonts.semibold,
    fontSize: 15,
  },
  description: {
    color: H2Colors.textSecondary,
    fontFamily: H2Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    maxWidth: 340,
  },
  errorText: {
    color: H2Colors.danger,
    fontFamily: H2Fonts.regular,
    fontSize: 13,
    marginTop: 12,
  },
  eyebrow: {
    color: H2Colors.primary,
    fontFamily: H2Fonts.data,
    fontSize: 10,
  },
  form: {
    backgroundColor: H2Colors.surface,
    borderColor: H2Colors.border,
    borderRadius: H2Radius.large,
    borderWidth: 1,
    marginTop: 38,
    padding: 20,
    shadowColor: H2Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 24,
  },
  input: {
    color: H2Colors.text,
    flex: 1,
    fontFamily: H2Fonts.regular,
    fontSize: 15,
    height: 52,
  },
  inputShell: {
    alignItems: "center",
    backgroundColor: H2Colors.background,
    borderColor: H2Colors.border,
    borderRadius: H2Radius.large,
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    paddingHorizontal: 14,
  },
  intro: { marginTop: 68 },
  label: {
    color: H2Colors.textSecondary,
    fontFamily: H2Fonts.medium,
    fontSize: 12,
    marginBottom: 8,
    marginTop: 16,
  },
  safeArea: { backgroundColor: H2Colors.background, flex: 1 },
  screen: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 12,
  },
  title: {
    color: H2Colors.text,
    fontFamily: H2Fonts.bold,
    fontSize: 36,
    lineHeight: 42,
    marginTop: 10,
  },
});
