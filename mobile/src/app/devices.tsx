import { StyleSheet, Text, View } from "react-native";

export default function DevicesScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Devices</Text>
      <Text style={styles.body}>H2GO Valve Controller online.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#070d18",
    padding: 24,
    paddingTop: 72,
  },
  title: {
    color: "white",
    fontSize: 34,
    fontWeight: "800",
  },
  body: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 16,
    marginTop: 12,
  },
});