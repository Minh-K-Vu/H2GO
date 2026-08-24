import { ChevronRight, Home, ShieldCheck, UserRound } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/app-screen";
import { H2Colors, H2Fonts, H2Radius } from "@/constants/theme";

const settings = [
  { icon: UserRound, label: "Account" },
  { icon: Home, label: "Home profile" },
  { icon: ShieldCheck, label: "Security" },
] as const;

export default function SettingsScreen() {
  return (
    <AppScreen
      eyebrow="Your system"
      title="Settings"
      description="Manage your account, property, and protection preferences."
    >
      <View style={styles.group}>
        {settings.map(({ icon: Icon, label }, index) => (
          <Pressable
            accessibilityRole="button"
            key={label}
            style={[styles.row, index > 0 && styles.rowBorder]}
          >
            <View style={styles.rowIcon}>
              <Icon color={H2Colors.primary} size={19} />
            </View>
            <Text style={styles.rowLabel}>{label}</Text>
            <ChevronRight color={H2Colors.textMuted} size={18} />
          </Pressable>
        ))}
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  group: {
    backgroundColor: H2Colors.surface,
    borderColor: H2Colors.border,
    borderRadius: H2Radius.large,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 66,
    paddingHorizontal: 16,
  },
  rowBorder: {
    borderTopColor: H2Colors.borderSoft,
    borderTopWidth: 1,
  },
  rowIcon: {
    alignItems: "center",
    backgroundColor: H2Colors.surfaceSelected,
    borderRadius: H2Radius.medium,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  rowLabel: {
    color: H2Colors.text,
    flex: 1,
    fontFamily: H2Fonts.medium,
    fontSize: 15,
    marginLeft: 13,
  },
});
