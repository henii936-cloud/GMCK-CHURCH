import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  RefreshControl,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { useLeaderGroup } from "../../hooks/useLeaderGroup";
import { attendanceService, memberService, Member } from "../../services/api";
import { LoadingScreen, Button, Card, EmptyState, Toast } from "../../components/UI";
import { formatToEthiopian } from "../../utils/ethiopianDate";
import { t } from "../../utils/i18n";

type Status = "Present" | "Absent" | "Excused";

export default function AttendanceScreen() {
  const { user } = useAuth();
  const { groupId, loading: groupLoading } = useLeaderGroup();
  const [members, setMembers] = useState<Member[]>([]);
  const [attendance, setAttendance] = useState<Record<string, Status>>({});
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"take" | "history">("take");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    if (groupId) load();
  }, [groupId]);

  const load = async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      const data = await memberService.getMembers();
      const filtered = data.filter((m: Member) => m.group_id === groupId);
      setMembers(filtered);
      const init: Record<string, Status> = {};
      filtered.forEach((m: Member) => (init[m.id] = "Present"));
      setAttendance(init);
      const hist = await attendanceService.getAttendanceHistory(groupId);
      setHistory(hist);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  const setStatus = (id: string, status: Status) =>
    setAttendance((prev) => ({ ...prev, [id]: status }));

  const setAll = (status: Status) => {
    const next: Record<string, Status> = {};
    members.forEach((m) => (next[m.id] = status));
    setAttendance(next);
  };

  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!groupId) return;
    setSaving(true);
    try {
      const records = members.map((m) => ({
        member_id: m.id,
        group_id: groupId,
        status: attendance[m.id] ?? "Present",
        date: today,
      }));
      await attendanceService.saveAttendance(records);
      showToast(t("saved"), "success");
      const hist = await attendanceService.getAttendanceHistory(groupId);
      setHistory(hist);
      setTimeout(() => setActiveTab("history"), 1500);
    } catch (err: any) {
      showToast(`Error: ${err.message}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const alreadyTakenToday = history.some((r) => r.date === today);
  const filtered = members.filter((m) =>
    m.full_name?.toLowerCase().includes(search.toLowerCase())
  );
  const presentCount = Object.values(attendance).filter((s) => s === "Present").length;
  const absentCount = Object.values(attendance).filter((s) => s === "Absent").length;
  const excusedCount = Object.values(attendance).filter((s) => s === "Excused").length;

  if (loading || groupLoading) return <LoadingScreen message={t("loading")} />;

  return (
    <View style={styles.container}>
      {toast && <Toast message={toast.msg} type={toast.type} />}

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "take" && styles.tabActive]}
          onPress={() => setActiveTab("take")}
        >
          <Text style={[styles.tabText, activeTab === "take" && styles.tabTextActive]}>
            📋 {t("take")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.tabActive]}
          onPress={() => setActiveTab("history")}
        >
          <Text style={[styles.tabText, activeTab === "history" && styles.tabTextActive]}>
            📅 {t("history")}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "take" ? (
        alreadyTakenToday ? (
          <View style={styles.doneContainer}>
            <Text style={styles.doneIcon}>✅</Text>
            <Text style={styles.doneTitle}>{t("attendanceComplete")}</Text>
            <Text style={styles.doneSub}>{t("alreadyRecorded")}</Text>
            <Button onPress={() => setActiveTab("history")} style={{ marginTop: 16 }}>
              {t("viewHistory")}
            </Button>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            {/* Search + bulk */}
            <View style={styles.searchRow}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search members..."
                placeholderTextColor="#9ca3af"
                value={search}
                onChangeText={setSearch}
              />
            </View>
            <View style={styles.bulkRow}>
              {(["Present", "Absent", "Excused"] as Status[]).map((s) => (
                <TouchableOpacity
                  key={s}
                  style={styles.bulkBtn}
                  onPress={() => setAll(s)}
                >
                  <Text style={styles.bulkBtnText}>All {s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <FlatList
              data={filtered}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.list}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002c53" />}
              ListEmptyComponent={<EmptyState title="No members found." />}
              renderItem={({ item }) => {
                const status = attendance[item.id] ?? "Present";
                const colors: Record<Status, { bg: string; border: string; text: string }> = {
                  Present: { bg: "#d1fae5", border: "#059669", text: "#059669" },
                  Absent: { bg: "#fee2e2", border: "#dc2626", text: "#dc2626" },
                  Excused: { bg: "#fef3c7", border: "#d97706", text: "#d97706" },
                };
                const c = colors[status];
                return (
                  <View style={[styles.memberCard, { backgroundColor: c.bg, borderColor: c.border }]}>
                    <View style={styles.memberRow}>
                      <View style={[styles.avatarFallback, { backgroundColor: c.border + "30" }]}>
                        <Text style={[styles.avatarInitial, { color: c.border }]}>
                          {item.full_name?.charAt(0)}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.memberName}>{item.full_name}</Text>
                        <Text style={[styles.statusLabel, { color: c.text }]}>{status}</Text>
                      </View>
                    </View>
                    <View style={styles.statusBtns}>
                      {(["Present", "Absent", "Excused"] as Status[]).map((s) => (
                        <TouchableOpacity
                          key={s}
                          style={[
                            styles.statusBtn,
                            status === s && { backgroundColor: colors[s].border },
                          ]}
                          onPress={() => setStatus(item.id, s)}
                        >
                          <Text
                            style={[
                              styles.statusBtnText,
                              status === s && { color: "#fff" },
                            ]}
                          >
                            {s === "Present" ? "✓" : s === "Absent" ? "✗" : "E"}
                          </Text>
                          <Text
                            style={[
                              styles.statusBtnLabel,
                              status === s && { color: "#fff" },
                            ]}
                          >
                            {s}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                );
              }}
              ListFooterComponent={
                <View style={styles.footer}>
                  <View style={styles.statsRow}>
                    <Text style={styles.statGreen}>{presentCount} Present</Text>
                    <Text style={styles.statRed}>{absentCount} Absent</Text>
                    <Text style={styles.statAmber}>{excusedCount} Excused</Text>
                  </View>
                  <Button onPress={handleSave} loading={saving} disabled={members.length === 0}>
                    {saving ? t("saving") : t("finalizeAttendance")}
                  </Button>
                </View>
              }
            />
          </View>
        )
      ) : (
        // History tab
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002c53" />}
          ListEmptyComponent={<EmptyState title="No attendance history yet." />}
          renderItem={({ item }) => {
            const statusColor =
              item.status === "Present" ? "#059669" : item.status === "Absent" ? "#dc2626" : "#d97706";
            return (
              <View style={styles.historyCard}>
                <View style={styles.historyLeft}>
                  <Text style={styles.historyName}>{item.members?.full_name ?? "Member"}</Text>
                  <Text style={styles.historyDate}>{formatToEthiopian(item.date)}</Text>
                </View>
                <View style={[styles.historyBadge, { backgroundColor: statusColor + "20" }]}>
                  <Text style={[styles.historyBadgeText, { color: statusColor }]}>
                    {item.status}
                  </Text>
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  tabs: { flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  tab: { flex: 1, paddingVertical: 14, alignItems: "center" },
  tabActive: { borderBottomWidth: 2, borderBottomColor: "#002c53" },
  tabText: { fontSize: 13, fontWeight: "600", color: "#9ca3af" },
  tabTextActive: { color: "#002c53", fontWeight: "700" },
  searchRow: { padding: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  searchInput: { backgroundColor: "#f3f4f6", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#1a1a2e" },
  bulkRow: { flexDirection: "row", gap: 8, padding: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  bulkBtn: { flex: 1, backgroundColor: "#f3f4f6", borderRadius: 8, paddingVertical: 8, alignItems: "center" },
  bulkBtnText: { fontSize: 11, fontWeight: "700", color: "#002c53" },
  list: { padding: 12, gap: 10, paddingBottom: 40 },
  memberCard: { borderRadius: 14, padding: 14, borderWidth: 1.5, gap: 10 },
  memberRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarFallback: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontSize: 16, fontWeight: "700" },
  memberName: { fontSize: 15, fontWeight: "700", color: "#1a1a2e" },
  statusLabel: { fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  statusBtns: { flexDirection: "row", gap: 8 },
  statusBtn: { flex: 1, backgroundColor: "#fff", borderRadius: 10, paddingVertical: 8, alignItems: "center", gap: 2 },
  statusBtnText: { fontSize: 16, fontWeight: "700", color: "#6b7280" },
  statusBtnLabel: { fontSize: 9, fontWeight: "700", textTransform: "uppercase", color: "#6b7280" },
  footer: { padding: 16, gap: 12 },
  statsRow: { flexDirection: "row", gap: 8 },
  statGreen: { flex: 1, textAlign: "center", backgroundColor: "#d1fae5", color: "#059669", fontWeight: "700", fontSize: 12, paddingVertical: 6, borderRadius: 8 },
  statRed: { flex: 1, textAlign: "center", backgroundColor: "#fee2e2", color: "#dc2626", fontWeight: "700", fontSize: 12, paddingVertical: 6, borderRadius: 8 },
  statAmber: { flex: 1, textAlign: "center", backgroundColor: "#fef3c7", color: "#d97706", fontWeight: "700", fontSize: 12, paddingVertical: 6, borderRadius: 8 },
  doneContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  doneIcon: { fontSize: 64, marginBottom: 16 },
  doneTitle: { fontSize: 22, fontWeight: "800", color: "#002c53", marginBottom: 8 },
  doneSub: { fontSize: 14, color: "#6b7280", textAlign: "center" },
  historyCard: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff", borderRadius: 12, padding: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 },
  historyLeft: { gap: 2 },
  historyName: { fontSize: 14, fontWeight: "700", color: "#1a1a2e" },
  historyDate: { fontSize: 12, color: "#9ca3af" },
  historyBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  historyBadgeText: { fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
});
