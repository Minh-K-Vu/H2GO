import { Droplets } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { H2Colors, H2Fonts, H2Radius } from "@/constants/theme";

type H2BrandProps = {
  compact?: boolean;
};

export function H2Brand({ compact = false }: H2BrandProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.mark, compact && styles.compactMark]}>
        <Droplets
          color={H2Colors.background}
          size={compact ? 17 : 20}
          strokeWidth={2.4}
        />
      </View>
      <View>
        <Text style={[styles.name, compact && styles.compactName]}>H2</Text>
        {!compact ? (
          <Text style={styles.product}>Water intelligence</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  compactMark: {
    height: 30,
    width: 30,
  },
  compactName: {
    fontSize: 16,
  },
  container: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  mark: {
    alignItems: "center",
    backgroundColor: H2Colors.primary,
    borderRadius: H2Radius.large,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  name: {
    color: H2Colors.text,
    fontFamily: H2Fonts.bold,
    fontSize: 18,
  },
  product: {
    color: H2Colors.textMuted,
    fontFamily: H2Fonts.regular,
    fontSize: 10,
    marginTop: 1,
  },
});
