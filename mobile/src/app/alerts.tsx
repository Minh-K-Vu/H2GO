import { Activity, CheckCircle2, ShieldCheck } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

import { AppScreen } from "@/components/app-screen";
import { H2Colors, H2Fonts, H2Radius } from "@/constants/theme";

const signalHeights = [18, 24, 19, 30, 22, 20, 34, 21, 17, 25, 20, 16];

export default function AlertsScreen() {
  return (
    <AppScreen
      eyebrow="Protection"
      title="Alerts"
      description="Important changes in your home's water system will appear here."
    >
      <View style={styles.monitorCard}>
        <View style={styles.monitorTopRow}>
          <View style={styles.iconContainer}>
            <ShieldCheck color={H2Colors.white} size={24} />
          </View>
          <View style={styles.liveBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Live monitoring</Text>
          </View>
        </View>

        <Text style={styles.monitorTitle}>All clear at home.</Text>
        <Text style={styles.monitorBody}>
          H2 is watching pressure and flow across every connected monitor.
        </Text>

        <View style={styles.signalVisual}>
          {signalHeights.map((height, index) => (
            <Animated.View
              entering={FadeInUp.delay(index * 35).duration(300)}
              key={`${height}-${index}`}
              style={[styles.signalBar, { height }]}
            />
          ))}
        </View>
      </View>

      <Text style={styles.sectionLabel}>Latest activity</Text>
      <View style={styles.activityList}>
        <View style={styles.activityRow}>
          <View style={styles.activityIcon}>
            <CheckCircle2 color={H2Colors.success} size={18} />
          </View>
          <View style={styles.activityCopy}>
            <Text style={styles.activityTitle}>System check complete</Text>
            <Text style={styles.activityDetail}>Flow is within your normal range</Text>
          </View>
          <Text style={styles.activityTime}>Now</Text>
        </View>

        <View style={[styles.activityRow, styles.activityBorder]}>
          <View style={styles.activityIconBlue}>
            <Activity color={H2Colors.ocean} size={18} />
          </View>
          <View style={styles.activityCopy}>
            <Text style={styles.activityTitle}>Monitoring active</Text>
            <Text style={styles.activityDetail}>No unusual water use detected</Text>
          </View>
          <Text style={styles.activityTime}>Today</Text>
        </View>
      </View>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  activityBorder: { borderTopColor: H2Colors.borderSoft, borderTopWidth: 1 },
  activityCopy: { flex: 1, marginLeft: 11 },
  activityDetail: {
    color: H2Colors.textSecondary,
    fontFamily: H2Fonts.regular,
    fontSize: 11,
    marginTop: 4,
  },
  activityIcon: {
    alignItems: "center",
    backgroundColor: "rgba(20, 155, 116, 0.09)",
    borderRadius: H2Radius.medium,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  activityIconBlue: {
    alignItems: "center",
    backgroundColor: "rgba(36, 119, 243, 0.08)",
    borderRadius: H2Radius.medium,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  activityList: {
    backgroundColor: H2Colors.surface,
    borderColor: H2Colors.border,
    borderRadius: H2Radius.large,
    borderWidth: 1,
    overflow: "hidden",
  },
  activityRow: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 72,
    paddingHorizontal: 14,
  },
  activityTime: {
    color: H2Colors.textMuted,
    fontFamily: H2Fonts.data,
    fontSize: 8,
  },
  activityTitle: {
    color: H2Colors.text,
    fontFamily: H2Fonts.medium,
    fontSize: 13,
  },
  iconContainer: {
    alignItems: "center",
    backgroundColor: H2Colors.primary,
    borderRadius: H2Radius.large,
    height: 48,
    justifyContent: "center",
    width: 48,
  },
  liveBadge: { alignItems: "center", flexDirection: "row", gap: 6 },
  monitorBody: {
    color: "rgba(255, 255, 255, 0.66)",
    fontFamily: H2Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
    maxWidth: 310,
  },
  monitorCard: {
    backgroundColor: H2Colors.text,
    borderRadius: H2Radius.large,
    overflow: "hidden",
    padding: 18,
    shadowColor: H2Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
  },
  monitorTitle: {
    color: H2Colors.white,
    fontFamily: H2Fonts.bold,
    fontSize: 24,
    marginTop: 26,
  },
  monitorTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionLabel: {
    color: H2Colors.textMuted,
    fontFamily: H2Fonts.data,
    fontSize: 9,
    marginBottom: 10,
    marginTop: 24,
    textTransform: "uppercase",
  },
  signalBar: {
    backgroundColor: "rgba(112, 220, 208, 0.78)",
    borderRadius: 2,
    flex: 1,
    minWidth: 3,
  },
  signalVisual: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    height: 42,
    marginTop: 24,
  },
  statusDot: {
    backgroundColor: H2Colors.aqua,
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  statusText: {
    color: H2Colors.aqua,
    fontFamily: H2Fonts.data,
    fontSize: 9,
    textTransform: "uppercase",
  },
});
