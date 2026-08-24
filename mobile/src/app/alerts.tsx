import { BellRing } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { AppScreen } from "@/components/app-screen";
import { H2Colors, H2Fonts, H2Radius } from "@/constants/theme";

export default function AlertsScreen() {
  return (
    <AppScreen
      eyebrow="Protection"
      title="Alerts"
      description="Important changes in your home's water system will appear here."
    >
      <View style={styles.emptyState}>
        <View style={styles.iconContainer}>
          <BellRing color={H2Colors.primary} size={24} />
        </View>
        <Text style={styles.emptyTitle}>Everything looks normal</Text>
        <Text style={styles.emptyBody}>
          There are no active alerts for your home.
        </Text>
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>Monitoring is active</Text>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  emptyBody: {
    color: H2Colors.textSecondary,
    fontFamily: H2Fonts.regular,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 7,
    textAlign: "center",
  },
  emptyState: {
    alignItems: "center",
    borderColor: H2Colors.border,
    borderRadius: H2Radius.large,
    borderWidth: 1,
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  emptyTitle: {
    color: H2Colors.text,
    fontFamily: H2Fonts.semibold,
    fontSize: 17,
    marginTop: 18,
  },
  iconContainer: {
    alignItems: "center",
    backgroundColor: H2Colors.surfaceSelected,
    borderRadius: H2Radius.large,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  statusDot: {
    backgroundColor: H2Colors.success,
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  statusRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    marginTop: 22,
  },
  statusText: {
    color: H2Colors.success,
    fontFamily: H2Fonts.data,
    fontSize: 10,
    textTransform: "uppercase",
  },
});
