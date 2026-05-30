import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "../../context/AuthContext";
import { useLeaderGroup } from "../../hooks/useLeaderGroup";
import { groupService } from "../../services/api";
import { supabase } from "../../services/supabaseClient";
import { LoadingScreen, Card, Button } from "../../components/UI";
import { t } from "../../utils/i18n";
import { formatToEthiopianShort } from "../../utils/ethiopianDate";

export default function DashboardScreen() {
  const { user } = useAuth();
  const { group, groupId, loading, refetch } = useLeaderGroup();
  const router = useRouter();
  const [memberCount, setMemberCount] = useState(0);
  const [availableGroups, setAvailableGroups] = useState<any[]>([]);
  const [claiming, setClaiming] = useState(false);
  const [recentAttendance, setRecentAttendance] = useState<any>(null);
  const [recentStudy, setRecentStudy] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (groupId) {
      fetchStats();
    } else if (!loading) {
      fetchAvailableGroups();
    }
  }, [groupId, loading]);

  const fetchStats = async () => {
    if (!groupId) return;
    try {
      const { count } = await supabase
        .from("members")
        .select("*", { count: "exact", head: true })
        .eq("group_id", groupId);
      setMemberCount(count ?? 0);

      const { data: att } = await supabase
        .from("study_attendance")
        .select("date, status")
        .eq("group_id", groupId)
        .order("date", { ascending: false })
        .limit(1);
      setRecentAttendance(att?.[0] ?? null);

      const { data: study } = await supabase
        .from("study_progress")
        .select("study_topic, completion_date")
        .eq("group_id", groupId)
        .order("completion_date", { ascending: false })
        .limit(1);
      setRecentStudy(study?.[0] ?? null);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAvailableGroups = async () => {
    try {
      const data = await groupService.getGroups();
      setAvailableGroups(data.filter((g: any) => g.leaders.length === 0));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClaimGroup = async (gId: string) => {
    if (!user?.id) return;
    setClaiming(true);
    try {
      await groupService.assignLeader(gId, user.id);
      await refetch();
    } catch {
      Alert.alert("Error", "Failed to claim group. It may have been taken.");
    } finally {
      setClaiming(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    await fetchStats();
    setRefreshing(false);
  };

  if (loading) return <LoadingScreen message={t("loading")} />;

  // ── No group assigned: show selection ──
  if (!group) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.pageLabel}>Ministry Assignment</Text>
        <Text style={styles.pageTitle}>
          {t("welcome")},{" "}
          <Text style={styles.accent}>{user?.full_name}</Text>
        </Text>
        <Text style={styles.pageSubtitle}>{t("noGroupAssigned")}</Text>

        <View style={styles.groupList}>
          {availableGroups.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>{t("noGroupsAvailable")}</Text>
            </Card>
          ) : (
            availableGroups.map((g) => (
              <Card key={g.id} style={styles.groupCard}>
                <View style={styles.groupCardHeader}>
                  <View style={styles.groupIcon}>
                    <Text style={{ fontSize: 22 }}>👥</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.groupName}>{g.group_name}</Text>
                    <Text style={styles.groupLocation}>{g.location ?? "Location not set"}</Text>
                  </View>
                </View>
                <Button
                  onPress={() => handleClaimGroup(g.id)}
                  loading={claiming}
                  style={{ marginTop: 12 }}
                >
                  {t("leadThisGroup")} →
                </Button>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
    );
  }

  // ── Dashboard ──
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002c53" />}
    >
      {/* Greeting */}
      <Text style={styles.pageLabel}>Ministry Leadership</Text>
      <Text style={styles.pageTitle}>
        {t("welcome")},{" "}
        <Text style={styles.accent}>{user?.full_name}</Text>
      </Text>
      <Text style={styles.pageSubtitle}>
        Leader of <Text style={{ fontWeight: "700", color: "#002c53" }}>{group.group_name}</Text>
      </Text>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{memberCount}</Text>
          <Text style={styles.statLabel}>Members</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: "#002c53" }]}>
          <Text style={[styles.statNumber, { color: "#fff" }]}>✝</Text>
          <Text style={[styles.statLabel, { color: "rgba(255,255,255,0.7)" }]}>Active Group</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity
          style={[styles.actionCard, { borderLeftColor: "#002c53" }]}
          onPress={() => router.push("/(tabs)/members")}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>👥</Text>
          <Text style={styles.actionTitle}>{t("groupMembers")}</Text>
          <Text style={styles.actionSub}>{memberCount} members</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { borderLeftColor: "#059669" }]}
          onPress={() => router.push("/(tabs)/attendance")}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionTitle}>{t("takeAttendance")}</Text>
          <Text style={styles.actionSub}>Today's session</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { borderLeftColor: "#d97706" }]}
          onPress={() => router.push("/(tabs)/study")}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>📖</Text>
          <Text style={styles.actionTitle}>{t("logStudy")}</Text>
          <Text style={styles.actionSub}>Record progress</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { borderLeftColor: "#7c3aed" }]}
          onPress={() => router.push("/(tabs)/messages")}
          activeOpacity={0.8}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionTitle}>{t("messages")}</Text>
          <Text style={styles.actionSub}>Chat with team</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <Text style={styles.sectionTitle}>{t("recentActivity")}</Text>
      <Card style={styles.activityCard}>
        {recentAttendance ? (
          <View style={[styles.activityItem, { borderLeftColor: "#059669" }]}>
            <Text style={styles.activityTitle}>✅ Attendance Recorded</Text>
            <Text style={styles.activitySub}>
              {formatToEthiopianShort(recentAttendance.date)}
            </Text>
          </View>
        ) : (
          <View style={[styles.activityItem, { borderLeftColor: "#e5e7eb" }]}>
            <Text style={styles.activityTitle}>No attendance recorded yet</Text>
          </View>
        )}
        {recentStudy ? (
          <View style={[styles.activityItem, { borderLeftColor: "#d97706", marginTop: 10 }]}>
            <Text style={styles.activityTitle}>📖 {recentStudy.study_topic}</Text>
            <Text style={styles.activitySub}>
              {formatToEthiopianShort(recentStudy.completion_date)}
            </Text>
          </View>
        ) : (
          <View style={[styles.activityItem, { borderLeftColor: "#e5e7eb", marginTop: 10 }]}>
            <Text style={styles.activityTitle}>No study logged yet</Text>
          </View>
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  content: { padding: 20, paddingBottom: 40 },
  pageLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2, color: "#9ca3af", marginBottom: 4 },
  pageTitle: { fontSize: 26, fontWeight: "800", color: "#002c53", marginBottom: 4 },
  accent: { color: "#d97706", fontStyle: "italic" },
  pageSubtitle: { fontSize: 14, color: "#6b7280", marginBottom: 24 },
  statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: "#fff", borderRadius: 16, padding: 16, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  statNumber: { fontSize: 28, fontWeight: "800", color: "#002c53" },
  statLabel: { fontSize: 11, color: "#6b7280", fontWeight: "600", marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#002c53", marginBottom: 12 },
  actionsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  actionCard: { width: "47%", backgroundColor: "#fff", borderRadius: 16, padding: 16, borderLeftWidth: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  actionIcon: { fontSize: 24, marginBottom: 8 },
  actionTitle: { fontSize: 14, fontWeight: "700", color: "#002c53", marginBottom: 2 },
  actionSub: { fontSize: 11, color: "#9ca3af" },
  activityCard: { marginBottom: 24 },
  activityItem: { borderLeftWidth: 3, paddingLeft: 12, paddingVertical: 4 },
  activityTitle: { fontSize: 14, fontWeight: "700", color: "#1a1a2e" },
  activitySub: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
  groupList: { gap: 12 },
  groupCard: { gap: 4 },
  groupCardHeader: { flexDirection: "row", alignItems: "center", gap: 12 },
  groupIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" },
  groupName: { fontSize: 16, fontWeight: "700", color: "#002c53" },
  groupLocation: { fontSize: 12, color: "#9ca3af" },
  emptyText: { textAlign: "center", color: "#9ca3af", fontStyle: "italic" },
});
