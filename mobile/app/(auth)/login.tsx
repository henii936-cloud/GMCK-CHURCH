import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { Input, Button } from "../../components/UI";
import { t } from "../../utils/i18n";

export default function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert(t("error"), "Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: any) {
      Alert.alert(t("error"), err.message ?? t("loginError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>✝</Text>
          </View>
          <Text style={styles.appName}>GMCK Church</Text>
          <Text style={styles.subtitle}>Bible Leader Portal</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("login")}</Text>
          <Text style={styles.cardSubtitle}>Sign in to manage your group</Text>

          <View style={styles.form}>
            <Input
              label={t("email")}
              placeholder="leader@gmckchurch.org"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />
            <Input
              label={t("password")}
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
            <Button onPress={handleLogin} loading={loading} style={styles.loginBtn}>
              {loading ? t("signingIn") : t("login")}
            </Button>
          </View>
        </View>

        <Text style={styles.footer}>
          Bible Leaders only. Contact your administrator for access.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#002c53" },
  scroll: { flexGrow: 1, justifyContent: "center", padding: 24 },
  header: { alignItems: "center", marginBottom: 32 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoText: { fontSize: 36, color: "#fff" },
  appName: { fontSize: 28, fontWeight: "800", color: "#fff", letterSpacing: 0.5 },
  subtitle: { fontSize: 14, color: "rgba(255,255,255,0.6)", marginTop: 4, fontWeight: "500" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: { fontSize: 22, fontWeight: "800", color: "#002c53", marginBottom: 4 },
  cardSubtitle: { fontSize: 13, color: "#6b7280", marginBottom: 24 },
  form: { gap: 16 },
  loginBtn: { marginTop: 8 },
  footer: {
    textAlign: "center",
    color: "rgba(255,255,255,0.4)",
    fontSize: 12,
    marginTop: 24,
    lineHeight: 18,
  },
});
