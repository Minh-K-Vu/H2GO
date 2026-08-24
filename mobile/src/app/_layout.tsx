import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { IBMPlexMono_500Medium } from "@expo-google-fonts/ibm-plex-mono";
import { Tabs } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { Bell, Cpu, Gauge, Settings } from "lucide-react-native";
import { useEffect } from "react";
import {
  ActivityIndicator,
  type ColorValue,
  StyleSheet,
  View,
} from "react-native";

import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { H2Colors, H2Fonts, H2Radius } from "@/constants/theme";

void SplashScreen.preventAutoHideAsync();

type TabIconProps = {
  color: ColorValue;
  focused: boolean;
  icon: typeof Gauge;
  size: number;
};

function TabIcon({ color, focused, icon: Icon, size }: TabIconProps) {
  return (
    <View style={[styles.tabIcon, focused && styles.activeTabIcon]}>
      <Icon color={color} size={size - 2} strokeWidth={focused ? 2.4 : 2} />
    </View>
  );
}

function AppTabs() {
  const { sessionToken, isLoading } = useAuth();
  const isSignedIn = Boolean(sessionToken);

  if (isLoading) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={H2Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: styles.scene,
        tabBarStyle: {
          ...styles.tabBar,
          display: isSignedIn ? "flex" : "none",
        },
        tabBarActiveTintColor: H2Colors.primary,
        tabBarInactiveTintColor: H2Colors.textMuted,
        tabBarItemStyle: styles.tabItem,
        tabBarLabelStyle: styles.tabLabel,
      }}
    >
      <Tabs.Protected guard={isSignedIn}>
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, focused, size }) => (
              <TabIcon color={color} focused={focused} icon={Gauge} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="devices"
          options={{
            title: "Devices",
            tabBarIcon: ({ color, focused, size }) => (
              <TabIcon color={color} focused={focused} icon={Cpu} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="alerts"
          options={{
            title: "Alerts",
            tabBarIcon: ({ color, focused, size }) => (
              <TabIcon color={color} focused={focused} icon={Bell} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color, focused, size }) => (
              <TabIcon color={color} focused={focused} icon={Settings} size={size} />
            ),
          }}
        />
        <Tabs.Screen name="explore" options={{ href: null }} />
      </Tabs.Protected>

      <Tabs.Protected guard={!isSignedIn}>
        <Tabs.Screen name="login" options={{ title: "Login" }} />
      </Tabs.Protected>
    </Tabs>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    IBMPlexMono_500Medium,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <AppTabs />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  activeTabIcon: {
    backgroundColor: H2Colors.surfaceSelected,
    borderColor: "transparent",
  },
  loadingScreen: {
    alignItems: "center",
    backgroundColor: H2Colors.background,
    flex: 1,
    justifyContent: "center",
  },
  scene: {
    backgroundColor: H2Colors.background,
  },
  tabBar: {
    backgroundColor: H2Colors.navigation,
    borderColor: H2Colors.border,
    borderRadius: H2Radius.large,
    borderTopColor: H2Colors.border,
    borderWidth: 1,
    bottom: 8,
    elevation: 10,
    height: 78,
    left: 12,
    paddingBottom: 8,
    paddingTop: 7,
    position: "absolute",
    right: 12,
    shadowColor: H2Colors.black,
    shadowOffset: { width: 0, height: 7 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
  },
  tabIcon: {
    alignItems: "center",
    borderColor: "transparent",
    borderRadius: H2Radius.large,
    borderWidth: 1,
    height: 32,
    justifyContent: "center",
    width: 44,
  },
  tabItem: {
    minWidth: 72,
  },
  tabLabel: {
    fontFamily: H2Fonts.semibold,
    fontSize: 9,
  },
});
