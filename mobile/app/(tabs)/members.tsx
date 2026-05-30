import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  Image,
  RefreshControl,
} from "react-native";
import { useLeaderGroup } from "../../hooks/useLeaderGroup";
import { memberService, Member } from "../../services/api";
import { LoadingScreen, Badge, EmptyState } from "../../components/UI";
import { t } from "../../utils/i18n";

export default function MembersScreen() {
  const { groupId, loading: groupLoading } = useLeaderGroup();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (groupId) loadMembers();
  }, [groupId]);

  const loadMembers = async () => {
    if (!groupId) return;
    try {
      setLoading(true);
      const data = await memberService.getMembers();
      setMembers(data.filter((m: Member) => m.group_id === groupId));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadMembers();
    setRefreshing(false);
  };

  const filtered = members.filter(
    (m) =>
      m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase()) ||
      m.phone?.toLowerCase().includes(search.toLowerCase())
  );

  const statusColor = (s?: string): "green" | "red" | "amber" => {
    if (s === "Active") return "green";
    if (s === "Inactive") return "red";
    return "amber";
  };

  if (loading || groupLoading) return <LoadingScreen message={t("loading")} />;

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder={t("searchMembers")}
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
        />
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{members.length} total</Text>
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#002c53" />}
        ListEmptyComponent={
          <EmptyState title={t("noMembersFound")} subtitle="Try a different search term." />
        }
        renderItem={({ item }) => (
          <View style={styles.memberCard}>
            {item.image_url ? (
              <Image source={{ uri: item.image_url }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarInitial}>{item.full_name?.charAt(0) ?? "?"}</Text>
              </View>
            )}
            <View style={styles.memberInfo}>
              <View style={styles.memberNameRow}>
                <Text style={styles.memberName}>{item.full_name}</Text>
                <Badge
                  label={item.leave_status ?? "Active"}
                  color={statusColor(item.leave_status)}
                />
              </View>
              {item.phone && (
                <Text style={styles.memberDetail}>📞 {item.phone}</Text>
              )}
              {item.email && (
                <Text style={styles.memberDetail} numberOfLines={1}>✉️ {item.email}</Text>
              )}
              {item.address && (
                <Text style={styles.memberDetail}>📍 {item.address}</Text>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  searchRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  searchInput: { flex: 1, backgroundColor: "#f3f4f6", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#1a1a2e" },
  countBadge: { backgroundColor: "#f3f4f6", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  countText: { fontSize: 12, fontWeight: "700", color: "#002c53" },
  list: { padding: 16, gap: 10, paddingBottom: 40 },
  memberCard: { flexDirection: "row", alignItems: "flex-start", backgroundColor: "#fff", borderRadius: 14, padding: 14, gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  avatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: "#e5e7eb" },
  avatarFallback: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#dbeafe", alignItems: "center", justifyContent: "center" },
  avatarInitial: { fontSize: 18, fontWeight: "700", color: "#002c53" },
  memberInfo: { flex: 1, gap: 3 },
  memberNameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  memberName: { fontSize: 15, fontWeight: "700", color: "#1a1a2e", flex: 1 },
  memberDetail: { fontSize: 12, color: "#6b7280" },
});
