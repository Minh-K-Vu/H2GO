import { StyleSheet, Text, View } from "react-native";

export default function AlertsScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Alerts</Text>
      <Text style={styles.body}>No active alerts.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#070d18",
    paddingHorizontal: 24,
    paddingTop: 72,
  },
  title: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 34,
    fontWeight: "800",
  },
  body: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    marginTop: 12,
  },
});
