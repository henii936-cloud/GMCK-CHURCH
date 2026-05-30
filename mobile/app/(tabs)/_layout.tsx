import { Tabs, useRouter } from "expo-router";
import { TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { useAuth } from "../../context/AuthContext";
import { t } from "../../utils/i18n";

const TAB_ICONS: Record<string, string> = {
  index: "🏠",
  members: "👥",
  attendance: "📋",
  study: "📖",
  messages: "💬",
};

export default function TabsLayout() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
            {TAB_ICONS[route.name] ?? "•"}
          </Text>
        ),
        tabBarActiveTintColor: "#002c53",
        tabBarInactiveTintColor: "#9ca3af",
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerTintColor: "#002c53",
        headerRight: () => (
          <TouchableOpacity
            onPress={() => router.push("/settings")}
            style={styles.avatarBtn}
          >
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.full_name?.charAt(0) ?? "?"}
              </Text>
            </View>
          </TouchableOpacity>
        ),
      })}
    >
      <Tabs.Screen name="index" options={{ title: t("dashboard") }} />
      <Tabs.Screen name="members" options={{ title: t("members") }} />
      <Tabs.Screen name="attendance" options={{ title: t("attendance") }} />
      <Tabs.Screen name="study" options={{ title: t("study") }} />
      <Tabs.Screen name="messages" options={{ title: t("messages") }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    height: 60,
    paddingBottom: 8,
    paddingTop: 4,
  },
  tabLabel: { fontSize: 10, fontWeight: "600" },
  header: { backgroundColor: "#fff", shadowColor: "transparent", elevation: 0, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#002c53" },
  avatarBtn: { marginRight: 16 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#002c53",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 14 },
});
