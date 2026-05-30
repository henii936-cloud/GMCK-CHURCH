import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useLeaderGroup } from "../../hooks/useLeaderGroup";
import { studyService } from "../../services/api";
import { Input, Button, Card, LoadingScreen, Toast } from "../../components/UI";
import EtDatePicker from "../../components/EtDatePicker";
import { t } from "../../utils/i18n";

export default function StudyScreen() {
  const { user } = useAuth();
  const { groupId, loading: groupLoading } = useLeaderGroup();
  const [isSkipping, setIsSkipping] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState({
    study_topic: "",
    completion_date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async () => {
    if (!groupId || !user?.id) return;
    if (!isSkipping && !form.study_topic.trim()) {
      showToast("Please enter a study topic.", "error");
      return;
    }
    if (isSkipping && !form.notes.trim()) {
      showToast("Please provide a reason for skipping.", "error");
      return;
    }

    setLoading(true);
    try {
      await studyService.saveStudy({
        study_topic: isSkipping ? "⚠️ Skipped Session" : form.study_topic,
        completion_date: form.completion_date,
        notes: isSkipping ? `REASON FOR SKIPPING: ${form.notes}` : form.notes,
        group_id: groupId,
        leader_id: user.id,
      });
      showToast(isSkipping ? t("skipLogged") : t("studyLogged"), "success");
      setForm({
        study_topic: "",
        completion_date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setIsSkipping(false);
    } catch (err: any) {
      showToast(`Error: ${err.message}`, "error");
    } finally {
      setLoading(false);
    }
  };

  if (groupLoading) return <LoadingScreen message={t("loading")} />;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {toast && <Toast message={toast.msg} type={toast.type} />}

        {/* Header */}
        <Text style={styles.pageLabel}>{t("spiritualGrowth")}</Text>
        <Text style={styles.pageTitle}>
          {t("studyProgress")}
        </Text>
        <Text style={styles.pageSubtitle}>
          Share what your group is learning with church leadership
        </Text>

        {/* Form Card */}
        <Card style={styles.formCard}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>
              {isSkipping ? t("skipSessionLog") : "New Study Log"}
            </Text>
            <TouchableOpacity
              style={[styles.skipToggle, isSkipping && styles.skipToggleActive]}
              onPress={() => { setIsSkipping(!isSkipping); }}
            >
              <Text style={[styles.skipToggleText, isSkipping && { color: "#fff" }]}>
                {isSkipping ? t("cancelSkip") : t("skipSession")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {!isSkipping && (
              <Input
                label={t("studyTopic")}
                placeholder="e.g. Ephesians 1:1-10 • Unity in Christ"
                value={form.study_topic}
                onChangeText={(v) => setForm({ ...form, study_topic: v })}
                required
              />
            )}

            <EtDatePicker
              label={isSkipping ? t("dateOfSkipped") : t("completionDate")}
              value={form.completion_date}
              onChange={(iso) => setForm({ ...form, completion_date: iso })}
              required
            />

            <Input
              label={isSkipping ? t("reasonForSkipping") : t("notes")}
              placeholder={
                isSkipping
                  ? "Why was this session skipped? (Required)"
                  : "Key takeaways or group reflections..."
              }
              value={form.notes}
              onChangeText={(v) => setForm({ ...form, notes: v })}
              multiline
              numberOfLines={4}
              required={isSkipping}
            />

            <Button
              onPress={handleSubmit}
              loading={loading}
              style={isSkipping ? styles.skipBtn : undefined}
            >
              {loading
                ? t("saving")
                : isSkipping
                ? t("logSkippedSession")
                : t("logStudyProgress")}
            </Button>
          </View>
        </Card>

        {/* Info Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.infoTitle}>📡 Live Visibility</Text>
          <Text style={styles.infoText}>
            Your logs are immediately visible to Admin on their dashboard activity feed. This helps track spiritual growth across all groups.
          </Text>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  content: { padding: 20, paddingBottom: 40 },
  pageLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2, color: "#9ca3af", marginBottom: 4 },
  pageTitle: { fontSize: 26, fontWeight: "800", color: "#002c53", marginBottom: 4 },
  pageSubtitle: { fontSize: 14, color: "#6b7280", marginBottom: 20 },
  formCard: { marginBottom: 16 },
  formHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  formTitle: { fontSize: 17, fontWeight: "800", color: "#002c53" },
  skipToggle: { backgroundColor: "#f3f4f6", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  skipToggleActive: { backgroundColor: "#002c53" },
  skipToggleText: { fontSize: 11, fontWeight: "700", color: "#002c53", textTransform: "uppercase", letterSpacing: 0.5 },
  form: { gap: 16 },
  skipBtn: { backgroundColor: "#d97706" },
  infoCard: { borderLeftWidth: 4, borderLeftColor: "#002c53" },
  infoTitle: { fontSize: 14, fontWeight: "700", color: "#002c53", marginBottom: 6 },
  infoText: { fontSize: 13, color: "#6b7280", lineHeight: 20 },
});
