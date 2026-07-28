import { Tabs } from "expo-router";
import { Bell, Cpu, Gauge, Settings } from "lucide-react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: "#070d18",
          borderTopColor: "rgba(255, 255, 255, 0.1)",
          height: 84,
          paddingTop: 10,
        },
        tabBarActiveTintColor: "#22d3ee",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.45)",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => (
            <Gauge color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="alerts"
        options={{
          title: "Alerts",
          tabBarIcon: ({ color, size }) => (
            <Bell color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="devices"
        options={{
          title: "Devices",
          tabBarIcon: ({ color, size }) => (
            <Cpu color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          title: "Login",
          tabBarIcon: ({ color, size }) => (
            <Settings color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}