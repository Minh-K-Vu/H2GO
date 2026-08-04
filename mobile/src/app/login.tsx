import { useState } from "react";
import { StyleSheet, Pressable, Text, TextInput, View } from "react-native";
import { apiRequest } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";

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
      const data = await apiRequest("/auth/login", {
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
    } catch (error) {
      setError("Could not sign in. Check your email and password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Sign in to H2GO</Text>

      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="rgba(255,255,255,0.4)"
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Password"
        placeholderTextColor="rgba(255,255,255,0.4)"
        style={styles.input}
        secureTextEntry
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>
          {loading ? "Signing In..." : "Sign In"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#070d18",
    padding: 24,
    paddingTop: 96,
  },
  title: {
    color: "white",
    fontSize: 34,
    fontWeight: "800",
    marginBottom: 32,
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderRadius: 16,
    color: "white",
    fontSize: 16,
    padding: 16,
    marginBottom: 14,
  },
  button: {
    backgroundColor: "#22d3ee",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: "#070d18",
    fontSize: 16,
    fontWeight: "800",
  },
  errorText: {
    color: "#f87171",
    fontSize: 14,
    marginBottom: 12,
  },
});
