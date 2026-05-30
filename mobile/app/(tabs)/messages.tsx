import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useAuth } from "../../context/AuthContext";
import { messageService } from "../../services/api";
import { supabase } from "../../services/supabaseClient";
import { t } from "../../utils/i18n";

// ─── Role config ──────────────────────────────────────────────────────────────
const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  admin:          { label: "Admin",   color: "#ef4444", bg: "#fee2e2" },
  shepherd:       { label: "Shepherd",color: "#10b981", bg: "#d1fae5" },
  bible_leader:   { label: "Leader",  color: "#3b82f6", bg: "#dbeafe" },
  finance:        { label: "Finance", color: "#f59e0b", bg: "#fef3c7" },
  youth_ministry: { label: "Youth",   color: "#8b5cf6", bg: "#ede9fe" },
  management:     { label: "Mgmt",    color: "#6366f1", bg: "#e0e7ff" },
  kids_ministry:  { label: "Kids",    color: "#ec4899", bg: "#fce7f3" },
};

interface Channel {
  id: string;
  name: string;
  icon: string;
  color: string;
  bg: string;
}

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  channel?: string;
  recipient_id?: string;
  is_optimistic?: boolean;
}

export default function MessagesScreen() {
  const { user } = useAuth();
  const [activeChannel, setActiveChannel] = useState<string>(`role:bible_leader`);
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});
  const [recentDMs, setRecentDMs] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [bibleGroups, setBibleGroups] = useState<any[]>([]);
  const [leaderGroupId, setLeaderGroupId] = useState<string | null>(null);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const activeChannelRef = useRef(activeChannel);

  useEffect(() => { activeChannelRef.current = activeChannel; }, [activeChannel]);

  // ── Initial data load ──
  useEffect(() => {
    if (!user) return;
    messageService.fetchProfiles().then(setProfiles);
    messageService.fetchRecentDMs(user.id).then(setRecentDMs);
    messageService.fetchAllUsers(user.id).then(setAllUsers);
    messageService.fetchBibleStudyGroups().then(setBibleGroups);

    // Get leader's assigned group
    supabase
      .from("group_leaders")
      .select("group_id")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.group_id) {
          setLeaderGroupId(data.group_id);
          setActiveChannel(`group:${data.group_id}`);
        }
      });
  }, [user]);

  // ── Fetch messages when channel changes ──
  useEffect(() => {
    if (!user) return;
    fetchMessages();

    // Realtime subscription
    const isDM = activeChannel.startsWith("dm:");
    const targetId = isDM ? activeChannel.split(":")[1] : null;
    const channelName = isDM
      ? `dm:${[user.id, targetId].sort().join("-")}`
      : `chat:${activeChannel}`;

    const sub = supabase
      .channel(channelName)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const msg = payload.new as Message;
          const cur = activeChannelRef.current;
          const curTarget = cur.startsWith("dm:") ? cur.split(":")[1] : null;

          const isCurrentChannel = msg.channel && msg.channel === cur;
          const isCurrentDM =
            !msg.channel &&
            cur.startsWith("dm:") &&
            ((msg.sender_id === user.id && msg.recipient_id === curTarget) ||
              (msg.sender_id === curTarget && msg.recipient_id === user.id));

          if (isCurrentChannel || isCurrentDM) {
            setMessages((prev) => {
              if (prev.find((m) => m.id === msg.id)) return prev;
              return [...prev, msg];
            });
          }
          if (!msg.channel && (msg.sender_id === user.id || msg.recipient_id === user.id)) {
            messageService.fetchRecentDMs(user.id).then(setRecentDMs);
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(sub); };
  }, [activeChannel, user?.id]);

  const fetchMessages = async () => {
    if (!user) return;
    setLoading(true);
    setMessages([]);
    try {
      const isDM = activeChannel.startsWith("dm:");
      const targetId = isDM ? activeChannel.split(":")[1] : null;
      const data = await messageService.fetchMessages(
        isDM ? null : activeChannel,
        user.id,
        targetId ?? undefined
      );
      setMessages(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMsg.trim() || !user) return;
    const content = newMsg.trim();
    setNewMsg("");

    const tempId = `temp-${Date.now()}`;
    const optimistic: Message = {
      id: tempId,
      sender_id: user.id,
      content,
      created_at: new Date().toISOString(),
      is_optimistic: true,
      ...(activeChannel.startsWith("dm:")
        ? { recipient_id: activeChannel.split(":")[1] }
        : { channel: activeChannel }),
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      const payload: any = { sender_id: user.id, content };
      if (activeChannel.startsWith("dm:")) {
        payload.recipient_id = activeChannel.split(":")[1];
      } else {
        payload.channel = activeChannel;
      }
      const real = await messageService.sendMessage(payload);
      setMessages((prev) => prev.map((m) => (m.id === tempId ? real : m)));
      if (activeChannel.startsWith("dm:")) {
        messageService.fetchRecentDMs(user.id).then(setRecentDMs);
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  const startDM = (userId: string) => {
    setActiveChannel(`dm:${userId}`);
    setShowUserSearch(false);
    setShowSidebar(false);
    if (!recentDMs.includes(userId)) setRecentDMs((prev) => [userId, ...prev]);
  };

  // ── Build channel list ──
  const roleChannels: Channel[] = [
    {
      id: "role:bible_leader",
      name: t("ministryChannel"),
      icon: "🛡️",
      color: ROLE_CONFIG.bible_leader.color,
      bg: ROLE_CONFIG.bible_leader.bg,
    },
    {
      id: "role:admin_shepherd",
      name: t("leadershipChannel"),
      icon: "#",
      color: "#10b981",
      bg: "#d1fae5",
    },
  ];

  const groupChannels: Channel[] = bibleGroups
    .filter((g) => g.id === leaderGroupId)
    .map((g) => ({
      id: `group:${g.id}`,
      name: g.group_name,
      icon: "👥",
      color: "#3b82f6",
      bg: "#dbeafe",
    }));

  const getChannelTitle = () => {
    if (activeChannel.startsWith("dm:")) {
      const id = activeChannel.split(":")[1];
      return profiles[id]?.full_name ?? "Private Chat";
    }
    const all = [...roleChannels, ...groupChannels];
    return all.find((c) => c.id === activeChannel)?.name ?? "Messages";
  };

  const filteredUsers = allUsers.filter((u) =>
    u.full_name?.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  // ── Sidebar ──
  if (showSidebar) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Sidebar header */}
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>{t("chat")}</Text>
          <TouchableOpacity
            style={styles.newDMBtn}
            onPress={() => setShowUserSearch(true)}
          >
            <Text style={styles.newDMBtnText}>＋</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <View>
              {/* Role channels */}
              <Text style={styles.sectionLabel}>Channels</Text>
              {roleChannels.map((ch) => (
                <TouchableOpacity
                  key={ch.id}
                  style={[styles.channelItem, activeChannel === ch.id && styles.channelItemActive]}
                  onPress={() => { setActiveChannel(ch.id); setShowSidebar(false); }}
                >
                  <View style={[styles.channelIcon, { backgroundColor: ch.bg }]}>
                    <Text style={{ fontSize: 18 }}>{ch.icon}</Text>
                  </View>
                  <Text style={[styles.channelName, activeChannel === ch.id && { color: "#fff" }]}>
                    {ch.name}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* Group channels */}
              {groupChannels.length > 0 && (
                <>
                  <Text style={styles.sectionLabel}>{t("bibleStudyGroups")}</Text>
                  {groupChannels.map((ch) => (
                    <TouchableOpacity
                      key={ch.id}
                      style={[styles.channelItem, activeChannel === ch.id && styles.channelItemActive]}
                      onPress={() => { setActiveChannel(ch.id); setShowSidebar(false); }}
                    >
                      <View style={[styles.channelIcon, { backgroundColor: ch.bg }]}>
                        <Text style={{ fontSize: 18 }}>{ch.icon}</Text>
                      </View>
                      <Text style={[styles.channelName, activeChannel === ch.id && { color: "#fff" }]}>
                        {ch.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              {/* DMs */}
              <Text style={styles.sectionLabel}>{t("directMessages")}</Text>
              {recentDMs.length === 0 && (
                <Text style={styles.emptyDMs}>No direct messages yet. Tap ＋ to start one.</Text>
              )}
              {recentDMs.map((dmId) => {
                const p = profiles[dmId];
                if (!p) return null;
                const isActive = activeChannel === `dm:${dmId}`;
                const role = ROLE_CONFIG[p.role];
                return (
                  <TouchableOpacity
                    key={dmId}
                    style={[styles.channelItem, isActive && styles.channelItemActive]}
                    onPress={() => { setActiveChannel(`dm:${dmId}`); setShowSidebar(false); }}
                  >
                    <View style={styles.dmAvatar}>
                      <Text style={styles.dmAvatarText}>{p.full_name?.charAt(0)}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.channelName, isActive && { color: "#fff" }]}>
                        {p.full_name}
                      </Text>
                      {role && (
                        <Text style={[styles.dmRole, { color: isActive ? "rgba(255,255,255,0.7)" : role.color }]}>
                          {role.label}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          }
        />

        {/* User search modal */}
        <Modal visible={showUserSearch} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{t("newMessage")}</Text>
                <TouchableOpacity onPress={() => setShowUserSearch(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.modalSearch}
                placeholder={t("searchUsers")}
                placeholderTextColor="#9ca3af"
                value={userSearchQuery}
                onChangeText={setUserSearchQuery}
                autoFocus
              />
              <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.id}
                style={{ maxHeight: 320 }}
                renderItem={({ item }) => {
                  const role = ROLE_CONFIG[item.role];
                  return (
                    <TouchableOpacity
                      style={styles.userItem}
                      onPress={() => startDM(item.id)}
                    >
                      <View style={styles.dmAvatar}>
                        <Text style={styles.dmAvatarText}>{item.full_name?.charAt(0)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.userName}>{item.full_name}</Text>
                        {role && (
                          <Text style={[styles.dmRole, { color: role.color }]}>{role.label}</Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                }}
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  // ── Chat window ──
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      {/* Chat header */}
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => setShowSidebar(true)} style={styles.backBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </TouchableOpacity>
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatTitle} numberOfLines={1}>{getChannelTitle()}</Text>
          <View style={styles.onlineRow}>
            <View style={styles.onlineDot} />
            <Text style={styles.onlineText}>Online</Text>
          </View>
        </View>
      </View>

      {/* Messages */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#002c53" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatIcon}>💬</Text>
              <Text style={styles.emptyChatTitle}>{t("startChatting")}</Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const isMe = item.sender_id === user?.id;
            const sender = profiles[item.sender_id];
            const prevMsg = messages[index - 1];
            const showSender = !isMe && (!prevMsg || prevMsg.sender_id !== item.sender_id);
            const senderRole = sender ? ROLE_CONFIG[sender.role] : null;
            const time = new Date(item.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <View style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowThem]}>
                {!isMe && (
                  <View style={styles.msgAvatar}>
                    {showSender && (
                      <View style={styles.senderAvatar}>
                        <Text style={styles.senderAvatarText}>
                          {sender?.full_name?.charAt(0) ?? "?"}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
                <View style={[styles.msgBubbleWrap, isMe ? { alignItems: "flex-end" } : { alignItems: "flex-start" }]}>
                  {showSender && !isMe && (
                    <View style={styles.senderNameRow}>
                      <Text style={styles.senderName}>{sender?.full_name}</Text>
                      {senderRole && (
                        <View style={[styles.rolePill, { backgroundColor: senderRole.bg }]}>
                          <Text style={[styles.rolePillText, { color: senderRole.color }]}>
                            {senderRole.label}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                  <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                    <Text style={[styles.bubbleText, isMe && { color: "#fff" }]}>
                      {item.content}
                    </Text>
                    <View style={styles.bubbleFooter}>
                      <Text style={[styles.bubbleTime, isMe && { color: "rgba(255,255,255,0.6)" }]}>
                        {time}
                      </Text>
                      {isMe && (
                        <Text style={styles.checkmark}>
                          {item.is_optimistic ? "✓" : "✓✓"}
                        </Text>
                      )}
                    </View>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.msgInput}
          placeholder={t("typeMessage")}
          placeholderTextColor="#9ca3af"
          value={newMsg}
          onChangeText={setNewMsg}
          multiline
          maxLength={1000}
          onSubmitEditing={sendMessage}
          returnKeyType="send"
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !newMsg.trim() && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!newMsg.trim()}
        >
          <Text style={styles.sendBtnText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },

  // Sidebar
  sidebarHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  sidebarTitle: { fontSize: 22, fontWeight: "800", color: "#002c53" },
  newDMBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" },
  newDMBtnText: { fontSize: 20, color: "#002c53", fontWeight: "700" },
  sectionLabel: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1.5, color: "#9ca3af", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 },
  channelItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12, marginHorizontal: 8, borderRadius: 14 },
  channelItemActive: { backgroundColor: "#002c53" },
  channelIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  channelName: { fontSize: 14, fontWeight: "700", color: "#1a1a2e", flex: 1 },
  dmAvatar: { width: 44, height: 44, borderRadius: 14, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" },
  dmAvatarText: { fontSize: 16, fontWeight: "700", color: "#002c53" },
  dmRole: { fontSize: 10, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5, marginTop: 1 },
  emptyDMs: { fontSize: 12, color: "#9ca3af", paddingHorizontal: 16, paddingVertical: 8, fontStyle: "italic" },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalCard: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: "70%" },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#002c53" },
  modalClose: { fontSize: 18, color: "#9ca3af", padding: 4 },
  modalSearch: { backgroundColor: "#f3f4f6", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14, color: "#1a1a2e", marginBottom: 12 },
  userItem: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#f9fafb" },
  userName: { fontSize: 14, fontWeight: "700", color: "#1a1a2e" },

  // Chat window
  chatHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  backArrow: { fontSize: 28, color: "#002c53", fontWeight: "300" },
  chatHeaderInfo: { flex: 1 },
  chatTitle: { fontSize: 16, fontWeight: "800", color: "#002c53" },
  onlineRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 1 },
  onlineDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#10b981" },
  onlineText: { fontSize: 10, fontWeight: "700", color: "#10b981", textTransform: "uppercase", letterSpacing: 0.5 },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center" },
  messageList: { padding: 12, gap: 4, paddingBottom: 8 },
  emptyChat: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 80 },
  emptyChatIcon: { fontSize: 48, marginBottom: 12 },
  emptyChatTitle: { fontSize: 16, fontWeight: "700", color: "#9ca3af" },

  // Messages
  msgRow: { flexDirection: "row", marginVertical: 2 },
  msgRowMe: { justifyContent: "flex-end" },
  msgRowThem: { justifyContent: "flex-start" },
  msgAvatar: { width: 36, marginRight: 6, alignItems: "center" },
  senderAvatar: { width: 32, height: 32, borderRadius: 10, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center" },
  senderAvatarText: { fontSize: 13, fontWeight: "700", color: "#002c53" },
  msgBubbleWrap: { maxWidth: "75%", gap: 2 },
  senderNameRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingLeft: 4, marginBottom: 2 },
  senderName: { fontSize: 10, fontWeight: "700", color: "#9ca3af", textTransform: "uppercase", letterSpacing: 0.5 },
  rolePill: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  rolePillText: { fontSize: 8, fontWeight: "700", textTransform: "uppercase" },
  bubble: { borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, maxWidth: "100%" },
  bubbleMe: { backgroundColor: "#002c53", borderBottomRightRadius: 4 },
  bubbleThem: { backgroundColor: "#fff", borderBottomLeftRadius: 4, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  bubbleText: { fontSize: 14, color: "#1a1a2e", lineHeight: 20 },
  bubbleFooter: { flexDirection: "row", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 4 },
  bubbleTime: { fontSize: 9, color: "#9ca3af" },
  checkmark: { fontSize: 10, color: "rgba(255,255,255,0.5)" },

  // Input
  inputBar: { flexDirection: "row", alignItems: "flex-end", gap: 8, padding: 12, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#f3f4f6" },
  msgInput: { flex: 1, backgroundColor: "#f3f4f6", borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, color: "#1a1a2e", maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#002c53", alignItems: "center", justifyContent: "center" },
  sendBtnDisabled: { backgroundColor: "#e5e7eb" },
  sendBtnText: { color: "#fff", fontSize: 16 },
});
