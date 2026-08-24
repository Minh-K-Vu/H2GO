import Constants from "expo-constants";
import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CheckCircle2,
  ChevronRight,
  Home,
  LockKeyhole,
  LogOut,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react-native";
import { useCallback, useState } from "react";

import {
  type Account,
  changePassword,
  fetchAccount,
  fetchHomeProfile,
  type HomeProfile,
  updateAccount,
  updateHomeProfile,
} from "@/api/settings";
import { useAuth } from "@/auth/AuthContext";
import { AppScreen } from "@/components/app-screen";
import { H2Colors, H2Fonts, H2Radius } from "@/constants/theme";

type SettingsSection = "account" | "home" | "security";

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const [account, setAccount] = useState<Account | null>(null);
  const [homeProfile, setHomeProfile] = useState<HomeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState<SettingsSection | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [homeName, setHomeName] = useState("");
  const [address, setAddress] = useState("");
  const [timezone, setTimezone] = useState("Australia/Adelaide");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const loadSettings = useCallback(async () => {
    try {
      const [accountResponse, profile] = await Promise.all([
        fetchAccount(),
        fetchHomeProfile(),
      ]);
      setAccount(accountResponse.user);
      setHomeProfile(profile);
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not load settings."));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadSettings();
    }, [loadSettings]),
  );

  function openSection(section: SettingsSection) {
    setError(null);
    setSuccess(null);

    if (section === "account") {
      setName(account?.name ?? "");
    } else if (section === "home") {
      setHomeName(homeProfile?.homeName ?? "My Home");
      setAddress(homeProfile?.address ?? "");
      setTimezone(homeProfile?.timezone ?? "Australia/Adelaide");
    } else {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }

    setActiveSection(section);
  }

  async function handleSaveAccount() {
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }

    setSaving(true);

    try {
      const response = await updateAccount(name.trim());
      setAccount(response.user);
      setSuccess("Account updated.");
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not update account."));
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveHome() {
    if (homeName.trim().length < 2 || !timezone.trim()) {
      setError("Home name and timezone are required.");
      return;
    }

    setSaving(true);

    try {
      const profile = await updateHomeProfile({
        homeName: homeName.trim(),
        address: address.trim() || null,
        timezone: timezone.trim(),
      });
      setHomeProfile(profile);
      setSuccess("Home profile updated.");
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not update home profile."));
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSaving(true);

    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Password changed. Other sessions were signed out.");
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Could not change password."));
    } finally {
      setSaving(false);
    }
  }

  function confirmLogout() {
    Alert.alert("Log out?", "You will need your email and password to sign in again.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => void signOut(),
      },
    ]);
  }

  const settings = [
    {
      id: "account" as const,
      icon: UserRound,
      label: "Account",
      detail: account ? `${account.name} · ${account.email}` : "Loading account",
    },
    {
      id: "home" as const,
      icon: Home,
      label: "Home profile",
      detail: homeProfile?.homeName ?? "Loading home",
    },
    {
      id: "security" as const,
      icon: ShieldCheck,
      label: "Security",
      detail: "Password and active sessions",
    },
  ];

  return (
    <>
      <AppScreen
        eyebrow="Your system"
        title="Settings"
        description="Manage your account, property, and protection preferences."
      >
        {error && !activeSection ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator color={H2Colors.primary} style={styles.loader} />
        ) : (
          <>
            <View style={styles.group}>
              {settings.map(({ id, icon: Icon, label, detail }, index) => (
                <Pressable
                  accessibilityRole="button"
                  key={id}
                  onPress={() => openSection(id)}
                  style={({ pressed }) => [
                    styles.row,
                    index > 0 && styles.rowBorder,
                    pressed && styles.rowPressed,
                  ]}
                >
                  <View style={styles.rowIcon}>
                    <Icon color={H2Colors.primary} size={19} />
                  </View>
                  <View style={styles.rowCopy}>
                    <Text style={styles.rowLabel}>{label}</Text>
                    <Text numberOfLines={1} style={styles.rowDetail}>
                      {detail}
                    </Text>
                  </View>
                  <ChevronRight color={H2Colors.textMuted} size={18} />
                </Pressable>
              ))}
            </View>

            <Pressable onPress={confirmLogout} style={styles.logoutButton}>
              <LogOut color={H2Colors.danger} size={18} />
              <Text style={styles.logoutText}>Log out</Text>
            </Pressable>

            <Text style={styles.versionText}>
              H2 app version {Constants.expoConfig?.version ?? "1.0.0"}
            </Text>
          </>
        )}
      </AppScreen>

      <SettingsModal
        account={account}
        activeSection={activeSection}
        address={address}
        confirmPassword={confirmPassword}
        currentPassword={currentPassword}
        error={error}
        homeName={homeName}
        name={name}
        newPassword={newPassword}
        onChangeAddress={setAddress}
        onChangeConfirmPassword={setConfirmPassword}
        onChangeCurrentPassword={setCurrentPassword}
        onChangeHomeName={setHomeName}
        onChangeName={setName}
        onChangeNewPassword={setNewPassword}
        onChangeTimezone={setTimezone}
        onClose={() => setActiveSection(null)}
        onSaveAccount={() => void handleSaveAccount()}
        onSaveHome={() => void handleSaveHome()}
        onSavePassword={() => void handleChangePassword()}
        saving={saving}
        success={success}
        timezone={timezone}
      />
    </>
  );
}

type SettingsModalProps = {
  account: Account | null;
  activeSection: SettingsSection | null;
  address: string;
  confirmPassword: string;
  currentPassword: string;
  error: string | null;
  homeName: string;
  name: string;
  newPassword: string;
  onChangeAddress: (value: string) => void;
  onChangeConfirmPassword: (value: string) => void;
  onChangeCurrentPassword: (value: string) => void;
  onChangeHomeName: (value: string) => void;
  onChangeName: (value: string) => void;
  onChangeNewPassword: (value: string) => void;
  onChangeTimezone: (value: string) => void;
  onClose: () => void;
  onSaveAccount: () => void;
  onSaveHome: () => void;
  onSavePassword: () => void;
  saving: boolean;
  success: string | null;
  timezone: string;
};

function SettingsModal(props: SettingsModalProps) {
  const { activeSection } = props;
  const title =
    activeSection === "account"
      ? "Account"
      : activeSection === "home"
        ? "Home profile"
        : "Security";

  return (
    <Modal
      animationType="slide"
      onRequestClose={props.onClose}
      presentationStyle="pageSheet"
      visible={activeSection !== null}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.modalKeyboard}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalEyebrow}>Settings</Text>
              <Text style={styles.modalTitle}>{title}</Text>
            </View>
            <Pressable
              accessibilityLabel="Close settings"
              onPress={props.onClose}
              style={styles.closeButton}
            >
              <X color={H2Colors.text} size={20} />
            </Pressable>
          </View>

          {props.error ? (
            <View style={styles.modalError}>
              <Text style={styles.errorText}>{props.error}</Text>
            </View>
          ) : null}
          {props.success ? (
            <View style={styles.successBanner}>
              <CheckCircle2 color={H2Colors.success} size={17} />
              <Text style={styles.successText}>{props.success}</Text>
            </View>
          ) : null}

          {activeSection === "account" ? (
            <>
              <Field
                label="Full name"
                onChangeText={props.onChangeName}
                value={props.name}
              />
              <Field
                editable={false}
                label="Email address"
                value={props.account?.email ?? ""}
              />
              <View style={styles.roleRow}>
                <Text style={styles.roleLabel}>Access role</Text>
                <Text style={styles.roleValue}>{props.account?.role ?? ""}</Text>
              </View>
              <SaveButton
                label="Save account"
                loading={props.saving}
                onPress={props.onSaveAccount}
              />
            </>
          ) : null}

          {activeSection === "home" ? (
            <>
              <Field
                label="Home name"
                onChangeText={props.onChangeHomeName}
                value={props.homeName}
              />
              <Field
                label="Property address"
                onChangeText={props.onChangeAddress}
                placeholder="Optional"
                value={props.address}
              />
              <Field
                autoCapitalize="none"
                label="Timezone"
                onChangeText={props.onChangeTimezone}
                value={props.timezone}
              />
              <SaveButton
                label="Save home profile"
                loading={props.saving}
                onPress={props.onSaveHome}
              />
            </>
          ) : null}

          {activeSection === "security" ? (
            <>
              <View style={styles.securityIcon}>
                <LockKeyhole color={H2Colors.primary} size={23} />
              </View>
              <Field
                label="Current password"
                onChangeText={props.onChangeCurrentPassword}
                secureTextEntry
                value={props.currentPassword}
              />
              <Field
                label="New password"
                onChangeText={props.onChangeNewPassword}
                secureTextEntry
                value={props.newPassword}
              />
              <Field
                label="Confirm new password"
                onChangeText={props.onChangeConfirmPassword}
                secureTextEntry
                value={props.confirmPassword}
              />
              <SaveButton
                label="Change password"
                loading={props.saving}
                onPress={props.onSavePassword}
              />
            </>
          ) : null}
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

type FieldProps = {
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  editable?: boolean;
  label: string;
  onChangeText?: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  value: string;
};

function Field({ label, ...inputProps }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={H2Colors.textMuted}
        style={[styles.input, inputProps.editable === false && styles.inputDisabled]}
        {...inputProps}
      />
    </View>
  );
}

function SaveButton({
  label,
  loading,
  onPress,
}: {
  label: string;
  loading: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable disabled={loading} onPress={onPress} style={styles.saveButton}>
      {loading ? (
        <ActivityIndicator color={H2Colors.background} size="small" />
      ) : (
        <Text style={styles.saveButtonText}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  closeButton: {
    alignItems: "center",
    backgroundColor: H2Colors.surface,
    borderRadius: H2Radius.large,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  errorBanner: {
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    borderColor: "rgba(251, 191, 36, 0.3)",
    borderRadius: H2Radius.large,
    borderWidth: 1,
    marginBottom: 14,
    padding: 12,
  },
  errorText: {
    color: H2Colors.warning,
    fontFamily: H2Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  field: { marginTop: 20 },
  fieldLabel: {
    color: H2Colors.textSecondary,
    fontFamily: H2Fonts.medium,
    fontSize: 12,
    marginBottom: 8,
  },
  group: {
    backgroundColor: H2Colors.surface,
    borderColor: H2Colors.border,
    borderRadius: H2Radius.large,
    borderWidth: 1,
    overflow: "hidden",
  },
  input: {
    backgroundColor: H2Colors.surface,
    borderColor: H2Colors.border,
    borderRadius: H2Radius.large,
    borderWidth: 1,
    color: H2Colors.text,
    fontFamily: H2Fonts.regular,
    fontSize: 15,
    height: 52,
    paddingHorizontal: 14,
  },
  inputDisabled: {
    color: H2Colors.textMuted,
    opacity: 0.7,
  },
  loader: { marginVertical: 44 },
  logoutButton: {
    alignItems: "center",
    borderColor: "rgba(248, 113, 113, 0.3)",
    borderRadius: H2Radius.large,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    height: 50,
    justifyContent: "center",
    marginTop: 18,
  },
  logoutText: {
    color: H2Colors.danger,
    fontFamily: H2Fonts.semibold,
    fontSize: 14,
  },
  modalError: {
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    borderColor: "rgba(251, 191, 36, 0.3)",
    borderRadius: H2Radius.large,
    borderWidth: 1,
    marginTop: 22,
    padding: 12,
  },
  modalEyebrow: {
    color: H2Colors.primary,
    fontFamily: H2Fonts.data,
    fontSize: 10,
    textTransform: "uppercase",
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalKeyboard: { backgroundColor: H2Colors.background, flex: 1 },
  modalSafeArea: {
    backgroundColor: H2Colors.background,
    flex: 1,
    padding: 20,
  },
  modalTitle: {
    color: H2Colors.text,
    fontFamily: H2Fonts.bold,
    fontSize: 25,
    marginTop: 6,
  },
  roleLabel: {
    color: H2Colors.textSecondary,
    fontFamily: H2Fonts.regular,
    fontSize: 13,
  },
  roleRow: {
    alignItems: "center",
    borderBottomColor: H2Colors.borderSoft,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 22,
    paddingBottom: 14,
  },
  roleValue: {
    color: H2Colors.primary,
    fontFamily: H2Fonts.data,
    fontSize: 10,
    textTransform: "uppercase",
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    minHeight: 76,
    paddingHorizontal: 16,
  },
  rowBorder: {
    borderTopColor: H2Colors.borderSoft,
    borderTopWidth: 1,
  },
  rowCopy: { flex: 1, marginLeft: 13 },
  rowDetail: {
    color: H2Colors.textMuted,
    fontFamily: H2Fonts.regular,
    fontSize: 11,
    marginTop: 4,
  },
  rowIcon: {
    alignItems: "center",
    backgroundColor: H2Colors.surfaceSelected,
    borderRadius: H2Radius.medium,
    height: 38,
    justifyContent: "center",
    width: 38,
  },
  rowLabel: {
    color: H2Colors.text,
    fontFamily: H2Fonts.medium,
    fontSize: 15,
  },
  rowPressed: { backgroundColor: H2Colors.surfaceSelected },
  saveButton: {
    alignItems: "center",
    backgroundColor: H2Colors.primary,
    borderRadius: H2Radius.large,
    height: 52,
    justifyContent: "center",
    marginTop: 30,
  },
  saveButtonText: {
    color: H2Colors.background,
    fontFamily: H2Fonts.bold,
    fontSize: 14,
  },
  securityIcon: {
    alignItems: "center",
    backgroundColor: H2Colors.surfaceSelected,
    borderRadius: H2Radius.large,
    height: 50,
    justifyContent: "center",
    marginTop: 28,
    width: 50,
  },
  successBanner: {
    alignItems: "center",
    backgroundColor: "rgba(52, 211, 153, 0.1)",
    borderColor: "rgba(52, 211, 153, 0.3)",
    borderRadius: H2Radius.large,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 22,
    padding: 12,
  },
  successText: {
    color: H2Colors.success,
    flex: 1,
    fontFamily: H2Fonts.regular,
    fontSize: 12,
  },
  versionText: {
    color: H2Colors.textMuted,
    fontFamily: H2Fonts.data,
    fontSize: 9,
    marginTop: 26,
    textAlign: "center",
    textTransform: "uppercase",
  },
});
