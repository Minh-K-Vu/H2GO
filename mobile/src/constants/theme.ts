import "@/global.css";

import { Platform } from "react-native";

// Shared H2 product colors. Keep feature screens on these tokens so the app
// stays visually aligned with the web dashboard as it grows.
export const H2Colors = {
  background: "#020817",
  navigation: "#07101D",
  surface: "#0B1220",
  surfaceRaised: "#111C2E",
  surfaceSelected: "#162536",
  border: "#1D3B46",
  borderSoft: "rgba(103, 232, 249, 0.12)",
  primary: "#22D3EE",
  primaryPressed: "#06B6D4",
  ocean: "#0EA5E9",
  aqua: "#67E8F9",
  text: "#F1FAFB",
  textSecondary: "#A7BBC1",
  textMuted: "#6F8991",
  success: "#34D399",
  warning: "#FBBF24",
  danger: "#F87171",
  white: "#FFFFFF",
  black: "#020817",
} as const;

// The older Expo starter components still read Colors, so both schemes point
// at the H2 interface palette until those starter components are removed.
export const Colors = {
  light: {
    text: H2Colors.text,
    background: H2Colors.background,
    backgroundElement: H2Colors.surface,
    backgroundSelected: H2Colors.surfaceSelected,
    textSecondary: H2Colors.textSecondary,
  },
  dark: {
    text: H2Colors.text,
    background: H2Colors.background,
    backgroundElement: H2Colors.surface,
    backgroundSelected: H2Colors.surfaceSelected,
    textSecondary: H2Colors.textSecondary,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const H2Fonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  data: "IBMPlexMono_500Medium",
} as const;

// Kept for the remaining Expo starter components.
export const Fonts = Platform.select({
  ios: {
    sans: H2Fonts.regular,
    serif: "ui-serif",
    rounded: H2Fonts.medium,
    mono: H2Fonts.data,
  },
  default: {
    sans: H2Fonts.regular,
    serif: "serif",
    rounded: H2Fonts.medium,
    mono: H2Fonts.data,
  },
  web: {
    sans: "var(--font-display)",
    serif: "var(--font-serif)",
    rounded: "var(--font-rounded)",
    mono: "var(--font-mono)",
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const H2Radius = {
  small: 4,
  medium: 6,
  large: 8,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
