import "@/global.css";

import { Platform } from "react-native";

// Shared H2 product colors. Keep feature screens on these tokens so the app
// stays visually aligned with the web dashboard as it grows.
export const H2Colors = {
  background: "#F3F7F6",
  navigation: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceRaised: "#E7EFED",
  surfaceSelected: "#DDF2EF",
  border: "#D7E2DF",
  borderSoft: "rgba(16, 33, 38, 0.08)",
  primary: "#087E8B",
  primaryPressed: "#066A75",
  ocean: "#2477F3",
  aqua: "#70DCD0",
  text: "#102126",
  textSecondary: "#52666B",
  textMuted: "#819196",
  success: "#149B74",
  warning: "#B86B00",
  danger: "#D84A4A",
  white: "#FFFFFF",
  black: "#102126",
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
