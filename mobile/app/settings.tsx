import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Switch,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../services/supabaseClient";
import { Input, Button, Card, Toast } from "../components/UI";
import { t, setLocale, i18n } from "../utils/i18n";

const ROLE_LABELS: Record<string, string> = {
  bible_leader: "Bible Leader",
  admin: "Administrator",
  shepherd: "Shepherd",
  finance: "Finance Officer",
  management: "Management",
  youth_ministry: "Youth Ministry",
  kids_ministry: "Kids Ministry",
};

type Tab = "profile" | "security" | "notifications" | "language";

export default function SettingsScreen() {
  const { user, logout, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Profile
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Security
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notifications
  const [notifApp, setNotifApp] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);

  // Language
  const [locale, setLocaleState] = useState<"en" | "am">(
    (i18n.locale as "en" | "am") ?? "en"
  );

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProfile = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, phone, bio, avatar_url, notification_email, notification_app")
      .eq("id", user!.id)
      .single();
    if (data) {
      setFullName(data.full_name ?? "");
      setPhone(data.phone ?? "");
      setBio(data.bio ?? "");
      setAvatarUrl(data.avatar_url ?? null);
      setNotifApp(data.notification_app ?? true);
      setNotifEmail(data.notification_email ?? true);
    }
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow photo access to upload a profile picture.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const ext = asset.uri.split(".").pop() ?? "jpg";
    const path = `${user!.id}/avatar.${ext}`;

    setUploading(true);
    try {
      const response = await fetch(asset.uri);
      const blob = await response.blob();
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { upsert: true, contentType: `image/${ext}` });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${publicUrl}?t=${Date.now()}`;
      setAvatarUrl(url);
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", user!.id);
      showToast("Profile photo updated!");
    } catch (err: any) {
      showToast(err.message ?? "Failed to upload photo", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName.trim(), phone: phone.trim(), bio: bio.trim() })
        .eq("id", user!.id);
      if (error) throw error;
      setUser((prev) => prev ? { ...prev, full_name: fullName.trim() } : prev);
      showToast(t("saveChanges") + " ✓");
    } catch (err: any) {
      showToast(err.message ?? "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      showToast("Password must be at least 8 characters.", "error");
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setConfirmPassword("");
      showToast("Password updated successfully!");
    } catch (err: any) {
      showToast(err.message ?? "Failed to update password", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ notification_email: notifEmail, notification_app: notifApp })
        .eq("id", user!.id);
      if (error) throw error;
      showToast(t("savePreferences") + " ✓");
    } catch (err: any) {
      showToast(err.message ?? "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = async (lang: "en" | "am") => {
    setLocaleState(lang);
    await setLocale(lang);
    showToast(`Language changed to ${lang === "en" ? "English" : "አማርኛ"}`);
  };

  const handleLogout = () => {
    Alert.alert(t("signOut"), t("signOutConfirm"), [
      { text: t("cancel"), style: "cancel" },
      { text: t("signOut"), style: "destructive", onPress: logout },
    ]);
  };

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "profile", label: "Profile", icon: "👤" },
    { id: "security", label: "Security", icon: "🔒" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "language", label: "Language", icon: "🌐" },
  ];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {toast && <Toast message={toast.msg} type={toast.type} />}

        {/* Profile card */}
        <Card style={styles.profileCard}>
          <TouchableOpacity style={styles.avatarContainer} onPress={handlePickAvatar}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>
                  {fullName?.charAt(0) ?? user?.email?.charAt(0) ?? "?"}
                </Text>
              </View>
            )}
            <View style={styles.cameraBtn}>
              {uploading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={{ fontSize: 12 }}>📷</Text>
              )}
            </View>
          </TouchableOpacity>
          <Text style={styles.profileName}>{fullName || "Your Name"}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>
              🛡️ {ROLE_LABELS[user?.role ?? ""] ?? user?.role}
            </Text>
          </View>
          <Text style={styles.memberSince}>
            Member since{" "}
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
              : "—"}
          </Text>
        </Card>

        {/* Tab nav */}
        <View style={styles.tabNav}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tabBtn, activeTab === tab.id && styles.tabBtnActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={styles.tabIcon}>{tab.icon}</Text>
              <Text style={[styles.tabLabel, activeTab === tab.id && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Profile tab ── */}
        {activeTab === "profile" && (
          <Card style={styles.tabCard}>
            <Text style={styles.tabTitle}>{t("personalInfo")}</Text>
            <View style={styles.form}>
              <Input
                label={t("fullName")}
                placeholder="Your full name"
                value={fullName}
                onChangeText={setFullName}
              />
              <Input
                label={t("phone")}
                placeholder="+251 9XX XXX XXX"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              <Input
                label={t("bio")}
                placeholder="A short description about your ministry role..."
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
              />
              {/* Role (read-only) */}
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyLabel}>System Role (Read-Only)</Text>
                <View style={styles.rolePill}>
                  <Text style={styles.rolePillText}>
                    🛡️ {ROLE_LABELS[user?.role ?? ""] ?? user?.role}
                  </Text>
                </View>
                <Text style={styles.readOnlyNote}>
                  Your role can only be changed by an Administrator.
                </Text>
              </View>
              <Button onPress={handleSaveProfile} loading={saving}>
                {t("saveChanges")}
              </Button>
            </View>
          </Card>
        )}

        {/* ── Security tab ── */}
        {activeTab === "security" && (
          <View style={{ gap: 12 }}>
            <Card style={styles.tabCard}>
              <Text style={styles.tabTitle}>{t("changePassword")}</Text>
              <Text style={styles.tabSubtitle}>Use at least 8 characters</Text>
              <View style={styles.form}>
                <Input
                  label={t("newPassword")}
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
                <Input
                  label={t("confirmPassword")}
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
                {newPassword.length > 0 && confirmPassword.length > 0 && (
                  <Text
                    style={[
                      styles.passwordMatch,
                      newPassword === confirmPassword ? { color: "#059669" } : { color: "#dc2626" },
                    ]}
                  >
                    {newPassword === confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                  </Text>
                )}
                <Button
                  onPress={handleChangePassword}
                  loading={saving}
                  disabled={!newPassword || newPassword !== confirmPassword}
                >
                  {t("updatePassword")}
                </Button>
              </View>
            </Card>

            {/* Sign out */}
            <Card style={[styles.tabCard, { borderLeftWidth: 4, borderLeftColor: "#dc2626" }]}>
              <View style={styles.signOutRow}>
                <View>
                  <Text style={styles.signOutTitle}>{t("signOut")}</Text>
                  <Text style={styles.signOutSub}>Sign out from all devices</Text>
                </View>
                <Button variant="danger" onPress={handleLogout} style={styles.signOutBtn}>
                  {t("signOut")}
                </Button>
              </View>
            </Card>
          </View>
        )}

        {/* ── Notifications tab ── */}
        {activeTab === "notifications" && (
          <Card style={styles.tabCard}>
            <Text style={styles.tabTitle}>{t("notifications")}</Text>
            <View style={styles.form}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>{t("inAppNotifications")}</Text>
                  <Text style={styles.toggleSub}>
                    Get notified for new messages and updates inside the app
                  </Text>
                </View>
                <Switch
                  value={notifApp}
                  onValueChange={setNotifApp}
                  trackColor={{ false: "#e5e7eb", true: "#002c53" }}
                  thumbColor="#fff"
                />
              </View>
              <View style={styles.divider} />
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleTitle}>{t("emailNotifications")}</Text>
                  <Text style={styles.toggleSub}>
                    Receive email alerts for important church updates
                  </Text>
                </View>
                <Switch
                  value={notifEmail}
                  onValueChange={setNotifEmail}
                  trackColor={{ false: "#e5e7eb", true: "#002c53" }}
                  thumbColor="#fff"
                />
              </View>
              <Button onPress={handleSaveNotifications} loading={saving}>
                {t("savePreferences")}
              </Button>
            </View>
          </Card>
        )}

        {/* ── Language tab ── */}
        {activeTab === "language" && (
          <Card style={styles.tabCard}>
            <Text style={styles.tabTitle}>{t("language")}</Text>
            <View style={styles.form}>
              {(["en", "am"] as const).map((lang) => (
                <TouchableOpacity
                  key={lang}
                  style={[styles.langOption, locale === lang && styles.langOptionActive]}
                  onPress={() => handleLanguageChange(lang)}
                >
                  <Text style={styles.langFlag}>{lang === "en" ? "🇬🇧" : "🇪🇹"}</Text>
                  <Text style={[styles.langLabel, locale === lang && { color: "#fff" }]}>
                    {lang === "en" ? "English" : "አማርኛ (Amharic)"}
                  </Text>
                  {locale === lang && <Text style={styles.langCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  content: { padding: 20, paddingBottom: 60 },

  profileCard: { alignItems: "center", paddingVertical: 24, marginBottom: 16 },
  avatarContainer: { position: "relative", marginBottom: 12 },
  avatar: { width: 88, height: 88, borderRadius: 24, borderWidth: 3, borderColor: "#e5e7eb" },
  avatarFallback: { width: 88, height: 88, borderRadius: 24, backgroundColor: "#002c53", alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontSize: 32, fontWeight: "800", color: "#fff" },
  cameraBtn: { position: "absolute", bottom: -4, right: -4, width: 28, height: 28, borderRadius: 14, backgroundColor: "#002c53", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
  profileName: { fontSize: 20, fontWeight: "800", color: "#002c53", marginBottom: 6 },
  roleBadge: { backgroundColor: "#dbeafe", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4, marginBottom: 6 },
  roleBadgeText: { fontSize: 12, fontWeight: "700", color: "#002c53" },
  memberSince: { fontSize: 11, color: "#9ca3af" },

  tabNav: { flexDirection: "row", backgroundColor: "#fff", borderRadius: 16, padding: 4, marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tabBtn: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 12, gap: 2 },
  tabBtnActive: { backgroundColor: "#002c53" },
  tabIcon: { fontSize: 16 },
  tabLabel: { fontSize: 9, fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.3 },
  tabLabelActive: { color: "#fff" },

  tabCard: { marginBottom: 12 },
  tabTitle: { fontSize: 17, fontWeight: "800", color: "#002c53", marginBottom: 4 },
  tabSubtitle: { fontSize: 12, color: "#9ca3af", marginBottom: 16 },
  form: { gap: 16, marginTop: 16 },

  readOnlyField: { gap: 6 },
  readOnlyLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, color: "#9ca3af" },
  rolePill: { backgroundColor: "#dbeafe", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, alignSelf: "flex-start" },
  rolePillText: { fontSize: 13, fontWeight: "700", color: "#002c53" },
  readOnlyNote: { fontSize: 11, color: "#9ca3af" },

  passwordMatch: { fontSize: 13, fontWeight: "700" },

  signOutRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  signOutTitle: { fontSize: 15, fontWeight: "700", color: "#dc2626" },
  signOutSub: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  signOutBtn: { paddingHorizontal: 16, paddingVertical: 10 },

  toggleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  toggleInfo: { flex: 1 },
  toggleTitle: { fontSize: 14, fontWeight: "700", color: "#1a1a2e" },
  toggleSub: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  divider: { height: 1, backgroundColor: "#f3f4f6" },

  langOption: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, backgroundColor: "#f3f4f6" },
  langOptionActive: { backgroundColor: "#002c53" },
  langFlag: { fontSize: 24 },
  langLabel: { flex: 1, fontSize: 15, fontWeight: "700", color: "#1a1a2e" },
  langCheck: { fontSize: 16, color: "#fff", fontWeight: "700" },
});
