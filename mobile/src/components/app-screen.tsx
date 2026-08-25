import type { PropsWithChildren, ReactNode } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";

import { H2Brand } from "@/components/h2-brand";
import { H2Colors, H2Fonts } from "@/constants/theme";

type AppScreenProps = PropsWithChildren<{
  title: string;
  description: string;
  eyebrow?: string;
  action?: ReactNode;
  scroll?: boolean;
}>;

export function AppScreen({
  title,
  description,
  eyebrow,
  action,
  scroll = true,
  children,
}: AppScreenProps) {
  const content = (
    <View style={styles.content}>
      <View style={styles.brandRow}>
        <H2Brand />
        {action}
      </View>

      <Animated.View entering={FadeInDown.duration(420).springify().damping(18)}>
        <View style={styles.heading}>
          {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        {children}
      </Animated.View>
    </View>
  );

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  description: {
    color: H2Colors.textSecondary,
    fontFamily: H2Fonts.regular,
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
    maxWidth: 340,
  },
  eyebrow: {
    color: H2Colors.primary,
    fontFamily: H2Fonts.data,
    fontSize: 9,
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  heading: {
    marginBottom: 24,
    marginTop: 28,
  },
  safeArea: {
    backgroundColor: H2Colors.background,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 112,
  },
  title: {
    color: H2Colors.text,
    fontFamily: H2Fonts.bold,
    fontSize: 32,
    lineHeight: 38,
    marginTop: 7,
  },
});
