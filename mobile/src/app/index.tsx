import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
  Dimensions,
} from "react-native";
import { useState } from "react";
import { BarChart } from "react-native-chart-kit";
import { useAuth } from "@/auth/AuthContext";

const stats = [
  {
    label: "Today's Usage",
    value: "184 L",
  },
  {
    label: "Saved This Week",
    value: "74 L",
  },
  {
    label: "Efficiency",
    value: "92%",
  },
  {
    label: "Leak Status",
    value: "Secure",
  },
];

const aiMessages = [
  "Good morning, Cameron.",
  "You've already saved 74 litres this week.",
  "I detected your shower is running longer than normal.",
];

const usageTabs = {
  Daily: {
    labels: ["12am", "6am", "12pm", "6pm"],
    datasets: [{ data: [4, 22, 9, 28] }],
  },
  Weekly: {
    labels: ["M", "T", "W", "T", "F", "S", "S"],
    datasets: [{ data: [142, 128, 156, 119, 134, 98, 87] }],
  },
  Monthly: {
    labels: ["W1", "W2", "W3", "W4"],
    datasets: [{ data: [980, 920, 845, 790] }],
  },
  Yearly: {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [{ data: [4200, 3850, 3600, 3400, 3200, 3050] }],
  },
};

type UsageTab = keyof typeof usageTabs;

export default function HomeScreen() {
  const screenWidth = Dimensions.get("window").width;
  const [holidayMode, setHolidayMode] = useState(false);
  const [selectedTab, setSelectedTab] = useState<UsageTab>("Daily");
  const [dashboardStats] = useState(stats);
  const { signOut } = useAuth();

  async function handleLogout() {
    await signOut();
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.screenContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>H2</Text>
        </View>

        <View>
          <Text style={styles.homeName}>{"Cameron's Home"}</Text>
          <Text style={styles.status}>All systems secure</Text>
        </View>
      </View>
      <View style={styles.aiPanel}>
        {aiMessages.map((message) => (
          <View key={message} style={styles.aiMessage}>
            <Text style={styles.aiIcon}>✦</Text>
            <Text style={styles.aiText}>{message}</Text>
          </View>
        ))}
      </View>
      <View style={styles.chartCard}>
        <View style={styles.tabRow}>
          {(Object.keys(usageTabs) as UsageTab[]).map((tab) => {
            const isActive = selectedTab === tab;

            return (
              <Pressable
                key={tab}
                onPress={() => setSelectedTab(tab)}
                style={[styles.tabButton, isActive && styles.activeTabButton]}
              >
                <Text
                  style={[styles.tabText, isActive && styles.activeTabText]}
                >
                  {tab}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <BarChart
          data={usageTabs[selectedTab]}
          width={screenWidth - 48}
          height={180}
          yAxisLabel=""
          yAxisSuffix="L"
          chartConfig={{
            backgroundColor: "#0b1220",
            backgroundGradientFrom: "#0b1220",
            backgroundGradientTo: "#0b1220",
            decimalPlaces: 0,
            color: () => "#22d3ee",
            labelColor: () => "rgba(255, 255, 255, 0.55)",
            barPercentage: 0.65,
            propsForBackgroundLines: {
              stroke: "rgba(255, 255, 255, 0.08)",
            },
          }}
          style={styles.chart}
          fromZero
        />
      </View>
      <View style={styles.statsGrid}>
        {dashboardStats.map((stat) => (
          <View key={stat.label} style={styles.statCard}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <Text style={styles.statValue}>{stat.value}</Text>
          </View>
        ))}
      </View>
      <View style={styles.settingRow}>
        <View>
          <Text style={styles.settingTitle}>Holiday Mode</Text>
          <Text style={styles.settingDescription}>
            Extra monitoring while you are away
          </Text>
        </View>

        <Switch
          value={holidayMode}
          onValueChange={setHolidayMode}
          trackColor={{
            false: "rgba(255, 255, 255, 0.16)",
            true: "#22d3ee",
          }}
          thumbColor="white"
        />
      </View>
      <Pressable style={styles.emergencyButton}>
        <Text style={styles.emergencyText}>Emergency Shut-Off</Text>
      </Pressable>
      <Pressable style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  apiStatus: {
    color: "#22d3ee",
    fontSize: 12,
    marginTop: 4,
  },
  aiPanel: {
    gap: 10,
    marginBottom: 24,
    marginTop: 24,
  },
  aiMessage: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  aiIcon: {
    color: "#22d3ee",
    fontSize: 14,
    marginTop: 1,
  },
  aiText: {
    color: "rgba(255, 255, 255, 0.78)",
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
  },

  settingRow: {
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },

  settingTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },

  settingDescription: {
    color: "rgba(255, 255, 255, 0.5)",
    fontSize: 12,
    marginTop: 4,
  },

  chartCard: {
    backgroundColor: "#070d18",
    paddingTop: 16,
    paddingBottom: 8,
    marginBottom: 24,
    overflow: "hidden",
  },

  chartTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
    paddingHorizontal: 16,
    marginBottom: 8,
  },

  chart: {
    borderRadius: 18,
  },

  screen: {
    flex: 1,
    backgroundColor: "#070d18",
  },

  screenContent: {
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#22d3ee",
    alignItems: "center",
    justifyContent: "center",
  },

  logoText: {
    color: "#070d18",
    fontSize: 14,
    fontWeight: "800",
  },

  homeName: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  status: {
    color: "#34d399",
    fontSize: 12,
    marginTop: 2,
  },

  title: {
    color: "white",
    fontSize: 34,
    fontWeight: "800",
    lineHeight: 40,
    marginTop: 36,
    marginBottom: 28,
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  statCard: {
    width: "47%",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },

  statLabel: {
    color: "rgba(255, 255, 255, 0.55)",
    fontSize: 11,
    textTransform: "uppercase",
  },

  statValue: {
    color: "white",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 8,
  },

  emergencyButton: {
    backgroundColor: "rgba(245, 158, 11, 0.16)",
    borderColor: "rgba(245, 158, 11, 0.35)",
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
  },

  emergencyText: {
    color: "#fcd34d",
    fontSize: 16,
    fontWeight: "700",
  },

  logoutButton: {
    borderColor: "rgba(255, 255, 255, 0.16)",
    borderWidth: 1,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 12,
  },

  logoutText: {
    color: "rgba(255, 255, 255, 0.72)",
    fontSize: 16,
    fontWeight: "700",
  },

  tabRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },

  tabButton: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },

  activeTabButton: {
    backgroundColor: "#22d3ee",
  },

  tabText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: 12,
    fontWeight: "700",
  },

  activeTabText: {
    color: "#070d18",
  },
});
