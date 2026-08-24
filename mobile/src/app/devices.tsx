import { useFocusEffect } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  Cpu,
  Droplets,
  Gauge,
  Link,
  MapPin,
  Pencil,
  Power,
  RadioTower,
  Thermometer,
  Trash2,
  Wifi,
  X,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  connectSimulator,
  deleteDevice,
  type Device,
  type DeviceReading,
  fetchAvailableSimulators,
  fetchDevices,
  fetchDeviceTelemetry,
  setDeviceValve,
  type Simulator,
  updateDevice,
} from "@/api/devices";
import { H2Brand } from "@/components/h2-brand";
import { H2Colors, H2Fonts, H2Radius } from "@/constants/theme";

const markerPositions = [
  { left: "72%", top: "52%" },
  { left: "47%", top: "58%" },
  { left: "27%", top: "48%" },
  { left: "61%", top: "76%" },
  { left: "84%", top: "67%" },
] as const;

type DeviceFormMode = "connect" | "edit";

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export default function DevicesScreen() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [simulators, setSimulators] = useState<Simulator[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const [reading, setReading] = useState<DeviceReading | null>(null);
  const [litresToday, setLitresToday] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<DeviceFormMode>("connect");
  const [formOpen, setFormOpen] = useState(false);
  const [formName, setFormName] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formSimulator, setFormSimulator] = useState<Simulator | null>(null);
  const [formDevice, setFormDevice] = useState<Device | null>(null);

  const selectedDevice = useMemo(
    () => devices.find((device) => device.id === selectedDeviceId) ?? devices[0],
    [devices, selectedDeviceId],
  );
  const telemetryDeviceId = selectedDevice?.id;

  const loadInventory = useCallback(async (showSpinner = false) => {
    if (showSpinner) {
      setRefreshing(true);
    }

    try {
      const [nextDevices, nextSimulators] = await Promise.all([
        fetchDevices(),
        fetchAvailableSimulators(),
      ]);
      setDevices(nextDevices);
      setSimulators(nextSimulators);
      if (nextDevices.length === 0) {
        setReading(null);
        setLitresToday(0);
      }
      setSelectedDeviceId((current) => {
        if (current && nextDevices.some((device) => device.id === current)) {
          return current;
        }

        return nextDevices[0]?.id ?? null;
      });
      setError(null);
    } catch (requestError) {
      setError(errorMessage(requestError, "Could not load devices."));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadInventory();
    }, [loadInventory]),
  );

  useEffect(() => {
    if (!telemetryDeviceId) {
      return undefined;
    }

    let active = true;

    async function loadTelemetry() {
      try {
        const telemetry = await fetchDeviceTelemetry(telemetryDeviceId);

        if (active) {
          setReading(telemetry.latest);
          setLitresToday(telemetry.today.litresToday);
        }
      } catch (requestError) {
        if (active) {
          setError(errorMessage(requestError, "Could not load telemetry."));
        }
      }
    }

    void loadTelemetry();
    const interval = setInterval(() => void loadTelemetry(), 15_000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [telemetryDeviceId]);

  function openConnectForm(simulator: Simulator) {
    setFormMode("connect");
    setFormSimulator(simulator);
    setFormDevice(null);
    setFormName(`H2 Monitor ${simulator.serialNumber.slice(-4)}`);
    setFormLocation("Main water line");
    setFormOpen(true);
  }

  function openEditForm(device: Device) {
    setFormMode("edit");
    setFormDevice(device);
    setFormSimulator(null);
    setFormName(device.name);
    setFormLocation(device.location ?? "");
    setFormOpen(true);
  }

  async function handleSaveForm() {
    const name = formName.trim();
    const location = formLocation.trim();

    if (!name || !location) {
      setError("Device name and location are required.");
      return;
    }

    const targetId = formSimulator?.id ?? formDevice?.id;

    if (!targetId) {
      return;
    }

    setBusyId(targetId);

    try {
      const device =
        formMode === "connect"
          ? await connectSimulator(targetId, { name, location })
          : await updateDevice(targetId, { name, location });
      setFormOpen(false);
      setSelectedDeviceId(device.id);
      await loadInventory();
      setError(null);
    } catch (requestError) {
      setError(errorMessage(requestError, "Could not save device."));
    } finally {
      setBusyId(null);
    }
  }

  function confirmDeleteDevice(device: Device) {
    Alert.alert(
      "Disconnect device?",
      `${device.name} will be removed from this home. Its simulator will become available again.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Disconnect",
          style: "destructive",
          onPress: () => void handleDeleteDevice(device),
        },
      ],
    );
  }

  async function handleDeleteDevice(device: Device) {
    setBusyId(device.id);

    try {
      await deleteDevice(device.id);
      await loadInventory();
      setError(null);
    } catch (requestError) {
      setError(errorMessage(requestError, "Could not disconnect device."));
    } finally {
      setBusyId(null);
    }
  }

  async function handleValveToggle() {
    if (!selectedDevice) {
      return;
    }

    setBusyId(selectedDevice.id);

    try {
      const response = await setDeviceValve(
        selectedDevice.id,
        !selectedDevice.is_on,
      );
      setDevices((current) =>
        current.map((device) =>
          device.id === response.data.id ? response.data : device,
        ),
      );
      const telemetry = await fetchDeviceTelemetry(selectedDevice.id);
      setReading(telemetry.latest);
      setLitresToday(telemetry.today.litresToday);
      setError(null);
    } catch (requestError) {
      setError(errorMessage(requestError, "Could not change valve state."));
    } finally {
      setBusyId(null);
    }
  }

  const metrics = [
    {
      icon: Droplets,
      label: "Current flow",
      value: reading ? `${reading.flowLpm.toFixed(2)} L/min` : "--",
    },
    {
      icon: Gauge,
      label: "Pressure",
      value: reading?.pressureBar != null ? `${reading.pressureBar.toFixed(2)} bar` : "--",
    },
    {
      icon: Thermometer,
      label: "Water temp",
      value:
        reading?.temperatureC != null
          ? `${reading.temperatureC.toFixed(1)} C`
          : "--",
    },
    {
      icon: RadioTower,
      label: "Today's usage",
      value: `${litresToday.toFixed(1)} L`,
    },
  ];

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadInventory(true)}
            tintColor={H2Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <H2Brand />
        </View>

        <View style={styles.heading}>
          <Text style={styles.eyebrow}>Digital twins</Text>
          <Text style={styles.title}>Devices</Text>
          <Text style={styles.description}>
            Connected monitors and nearby H2 hardware.
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable accessibilityLabel="Dismiss error" onPress={() => setError(null)}>
              <X color={H2Colors.warning} size={17} />
            </Pressable>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionEyebrow}>Discovery</Text>
            <Text style={styles.sectionTitle}>Available to connect</Text>
          </View>
          <Text style={styles.count}>{simulators.length}</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={H2Colors.primary} style={styles.loader} />
        ) : simulators.length === 0 ? (
          <View style={styles.emptyRow}>
            <Wifi color={H2Colors.textMuted} size={19} />
            <Text style={styles.emptyText}>No unpaired devices nearby</Text>
          </View>
        ) : (
          <View style={styles.availableList}>
            {simulators.map((simulator) => (
              <View key={simulator.id} style={styles.availableRow}>
                <View style={styles.deviceIcon}>
                  <Cpu color={H2Colors.primary} size={21} />
                </View>
                <View style={styles.availableCopy}>
                  <Text style={styles.availableModel}>{simulator.model}</Text>
                  <Text style={styles.serial}>{simulator.serialNumber}</Text>
                  <View style={styles.signalRow}>
                    <Wifi color={H2Colors.success} size={12} />
                    <Text style={styles.signalText}>{simulator.signalStrength}% signal</Text>
                  </View>
                </View>
                <Pressable
                  disabled={busyId !== null}
                  onPress={() => openConnectForm(simulator)}
                  style={styles.connectButton}
                >
                  <Link color={H2Colors.background} size={15} />
                  <Text style={styles.connectText}>Connect</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <View style={styles.sectionHeaderConnected}>
          <View>
            <Text style={styles.sectionEyebrow}>Home network</Text>
            <Text style={styles.sectionTitle}>Connected devices</Text>
          </View>
          <Text style={styles.count}>{devices.length}</Text>
        </View>

        <Animated.View
          entering={FadeInDown.delay(80).duration(460).springify().damping(18)}
          style={styles.houseVisual}
        >
          <Image
            source={require("../../assets/images/smart-home.png")}
            resizeMode="cover"
            style={styles.houseImage}
          />
          <View pointerEvents="none" style={styles.imageShade} />
          {devices.map((device, index) => {
            const selected = device.id === selectedDevice?.id;
            const position = markerPositions[index % markerPositions.length];

            return (
              <Pressable
                accessibilityLabel={`Select ${device.name}`}
                key={device.id}
                onPress={() => setSelectedDeviceId(device.id)}
                style={[
                  styles.marker,
                  position,
                  selected && styles.markerSelected,
                ]}
              >
                <View style={[styles.markerDot, selected && styles.markerDotSelected]} />
              </Pressable>
            );
          })}
          {devices.length === 0 ? (
            <View style={styles.noDeviceOverlay}>
              <Text style={styles.noDeviceText}>No connected device</Text>
            </View>
          ) : null}
        </Animated.View>

        {devices.length > 0 ? (
          <ScrollView
            contentContainerStyle={styles.deviceSelector}
            horizontal
            showsHorizontalScrollIndicator={false}
          >
            {devices.map((device) => {
              const selected = device.id === selectedDevice?.id;

              return (
                <Pressable
                  key={device.id}
                  onPress={() => setSelectedDeviceId(device.id)}
                  style={[
                    styles.deviceChip,
                    selected && styles.deviceChipSelected,
                  ]}
                >
                  <View
                    style={[
                      styles.deviceStatusDot,
                      device.status !== "online" && styles.warningDot,
                    ]}
                  />
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.deviceChipText,
                      selected && styles.deviceChipTextSelected,
                    ]}
                  >
                    {device.name}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : null}

        {selectedDevice ? (
          <View style={styles.detailSection}>
            <View style={styles.deviceHeader}>
              <View style={styles.deviceHeaderCopy}>
                <Text style={styles.deviceName}>{selectedDevice.name}</Text>
                <View style={styles.locationRow}>
                  <MapPin color={H2Colors.textMuted} size={13} />
                  <Text style={styles.locationText}>
                    {selectedDevice.location ?? "No location"}
                  </Text>
                </View>
              </View>
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>Live</Text>
              </View>
              <Pressable
                accessibilityLabel={`Edit ${selectedDevice.name}`}
                onPress={() => openEditForm(selectedDevice)}
                style={styles.iconButton}
              >
                <Pencil color={H2Colors.textSecondary} size={17} />
              </Pressable>
            </View>

            <Text style={styles.deviceSerial}>
              {selectedDevice.serial_number ?? "Physical device"}
            </Text>

            <View style={styles.metricsGrid}>
              {metrics.map(({ icon: Icon, label, value }) => (
                <View key={label} style={styles.metricCard}>
                  <View style={styles.metricLabelRow}>
                    <Icon color={H2Colors.primary} size={15} />
                    <Text style={styles.metricLabel}>{label}</Text>
                  </View>
                  <Text style={styles.metricValue}>{value}</Text>
                </View>
              ))}
            </View>

            <Pressable
              disabled={busyId !== null}
              onPress={() => void handleValveToggle()}
              style={[
                styles.valveButton,
                !selectedDevice.is_on && styles.valveButtonClosed,
              ]}
            >
              {busyId === selectedDevice.id ? (
                <ActivityIndicator color={H2Colors.white} size="small" />
              ) : (
                <Power color={H2Colors.white} size={18} />
              )}
              <Text style={styles.valveText}>
                {selectedDevice.is_on ? "Close main valve" : "Open main valve"}
              </Text>
            </Pressable>

            <Pressable
              disabled={busyId !== null}
              onPress={() => confirmDeleteDevice(selectedDevice)}
              style={styles.disconnectButton}
            >
              <Trash2 color={H2Colors.danger} size={16} />
              <Text style={styles.disconnectText}>Disconnect device</Text>
            </Pressable>
          </View>
        ) : null}
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={() => setFormOpen(false)}
        presentationStyle="pageSheet"
        visible={formOpen}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalKeyboard}
        >
          <SafeAreaView style={styles.modalSafeArea}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalEyebrow}>
                  {formMode === "connect" ? "Pair device" : "Device settings"}
                </Text>
                <Text style={styles.modalTitle}>
                  {formMode === "connect" ? "Connect to this home" : "Edit device"}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Close"
                onPress={() => setFormOpen(false)}
                style={styles.modalClose}
              >
                <X color={H2Colors.text} size={20} />
              </Pressable>
            </View>

            {formSimulator ? (
              <View style={styles.pairIdentity}>
                <Cpu color={H2Colors.primary} size={22} />
                <View>
                  <Text style={styles.pairModel}>{formSimulator.model}</Text>
                  <Text style={styles.serial}>{formSimulator.serialNumber}</Text>
                </View>
              </View>
            ) : null}

            <Text style={styles.inputLabel}>Device name</Text>
            <TextInput
              autoCapitalize="words"
              onChangeText={setFormName}
              placeholder="H2 Monitor"
              placeholderTextColor={H2Colors.textMuted}
              style={styles.input}
              value={formName}
            />

            <Text style={styles.inputLabel}>Location</Text>
            <TextInput
              autoCapitalize="words"
              onChangeText={setFormLocation}
              placeholder="Main water line"
              placeholderTextColor={H2Colors.textMuted}
              style={styles.input}
              value={formLocation}
            />

            <Pressable
              disabled={busyId !== null}
              onPress={() => void handleSaveForm()}
              style={styles.saveButton}
            >
              {busyId !== null ? (
                <ActivityIndicator color={H2Colors.background} size="small" />
              ) : (
                <Link color={H2Colors.background} size={18} />
              )}
              <Text style={styles.saveText}>
                {formMode === "connect" ? "Connect device" : "Save changes"}
              </Text>
            </Pressable>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  availableCopy: { flex: 1 },
  availableList: { gap: 10 },
  availableModel: {
    color: H2Colors.text,
    fontFamily: H2Fonts.semibold,
    fontSize: 14,
  },
  availableRow: {
    alignItems: "center",
    backgroundColor: H2Colors.surface,
    borderColor: H2Colors.border,
    borderRadius: H2Radius.large,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 82,
    padding: 12,
    shadowColor: H2Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
  },
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  connectButton: {
    alignItems: "center",
    backgroundColor: H2Colors.primary,
    borderRadius: H2Radius.medium,
    flexDirection: "row",
    gap: 5,
    height: 36,
    paddingHorizontal: 10,
  },
  connectText: {
    color: H2Colors.background,
    fontFamily: H2Fonts.semibold,
    fontSize: 12,
  },
  content: {
    paddingBottom: 120,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  count: {
    color: H2Colors.primary,
    fontFamily: H2Fonts.data,
    fontSize: 15,
  },
  description: {
    color: H2Colors.textSecondary,
    fontFamily: H2Fonts.regular,
    fontSize: 14,
    marginTop: 7,
  },
  detailSection: { marginTop: 6 },
  deviceChip: {
    alignItems: "center",
    backgroundColor: H2Colors.surface,
    borderColor: H2Colors.borderSoft,
    borderRadius: H2Radius.large,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    height: 40,
    maxWidth: 190,
    paddingHorizontal: 12,
  },
  deviceChipSelected: {
    backgroundColor: H2Colors.primary,
    borderColor: H2Colors.primary,
  },
  deviceChipText: {
    color: H2Colors.textSecondary,
    fontFamily: H2Fonts.medium,
    fontSize: 13,
    maxWidth: 145,
  },
  deviceChipTextSelected: { color: H2Colors.background },
  deviceHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  deviceHeaderCopy: { flex: 1 },
  deviceIcon: {
    alignItems: "center",
    backgroundColor: H2Colors.surfaceSelected,
    borderRadius: H2Radius.large,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  deviceName: {
    color: H2Colors.text,
    fontFamily: H2Fonts.bold,
    fontSize: 23,
  },
  deviceSelector: { gap: 9, paddingVertical: 18 },
  deviceSerial: {
    color: H2Colors.textMuted,
    fontFamily: H2Fonts.data,
    fontSize: 10,
    marginTop: 9,
    textTransform: "uppercase",
  },
  deviceStatusDot: {
    backgroundColor: H2Colors.success,
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  disconnectButton: {
    alignItems: "center",
    borderColor: "rgba(248, 113, 113, 0.3)",
    borderRadius: H2Radius.large,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    height: 48,
    justifyContent: "center",
    marginTop: 10,
  },
  disconnectText: {
    color: H2Colors.danger,
    fontFamily: H2Fonts.semibold,
    fontSize: 14,
  },
  emptyRow: {
    alignItems: "center",
    borderColor: H2Colors.border,
    borderRadius: H2Radius.large,
    borderStyle: "dashed",
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    minHeight: 72,
  },
  emptyText: {
    color: H2Colors.textMuted,
    fontFamily: H2Fonts.regular,
    fontSize: 13,
  },
  errorBanner: {
    alignItems: "center",
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    borderColor: "rgba(251, 191, 36, 0.3)",
    borderRadius: H2Radius.large,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 22,
    padding: 13,
  },
  errorText: {
    color: H2Colors.warning,
    flex: 1,
    fontFamily: H2Fonts.regular,
    fontSize: 12,
    lineHeight: 18,
  },
  eyebrow: {
    color: H2Colors.primary,
    fontFamily: H2Fonts.data,
    fontSize: 10,
    textTransform: "uppercase",
  },
  heading: { marginBottom: 30, marginTop: 34 },
  houseImage: { height: "100%", width: "100%" },
  houseVisual: {
    aspectRatio: 16 / 11,
    borderColor: H2Colors.border,
    borderRadius: H2Radius.large,
    borderWidth: 1,
    marginTop: 18,
    overflow: "hidden",
    position: "relative",
    shadowColor: H2Colors.black,
    shadowOffset: { width: 0, height: 9 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    width: "100%",
  },
  iconButton: {
    alignItems: "center",
    borderRadius: H2Radius.medium,
    height: 36,
    justifyContent: "center",
    width: 34,
  },
  imageShade: {
    backgroundColor: "rgba(2, 8, 23, 0.26)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
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
  inputLabel: {
    color: H2Colors.textSecondary,
    fontFamily: H2Fonts.medium,
    fontSize: 12,
    marginBottom: 8,
    marginTop: 20,
  },
  liveBadge: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
  },
  liveDot: {
    backgroundColor: H2Colors.success,
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  liveText: {
    color: H2Colors.success,
    fontFamily: H2Fonts.data,
    fontSize: 10,
    textTransform: "uppercase",
  },
  loader: { marginVertical: 28 },
  locationRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 5,
  },
  locationText: {
    color: H2Colors.textMuted,
    fontFamily: H2Fonts.regular,
    fontSize: 12,
  },
  marker: {
    alignItems: "center",
    backgroundColor: "rgba(2, 8, 23, 0.8)",
    borderColor: H2Colors.border,
    borderRadius: 8,
    borderWidth: 2,
    height: 34,
    justifyContent: "center",
    position: "absolute",
    transform: [{ translateX: -17 }, { translateY: -17 }],
    width: 34,
  },
  markerDot: {
    backgroundColor: H2Colors.textSecondary,
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  markerDotSelected: { backgroundColor: H2Colors.primary },
  markerSelected: {
    backgroundColor: "rgba(34, 211, 238, 0.22)",
    borderColor: H2Colors.primary,
  },
  metricCard: {
    backgroundColor: H2Colors.surface,
    borderColor: H2Colors.border,
    borderRadius: H2Radius.large,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    minHeight: 96,
    padding: 13,
    shadowColor: H2Colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
  },
  metricLabel: {
    color: H2Colors.textMuted,
    flex: 1,
    fontFamily: H2Fonts.data,
    fontSize: 9,
    textTransform: "uppercase",
  },
  metricLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  metricValue: {
    color: H2Colors.text,
    fontFamily: H2Fonts.bold,
    fontSize: 18,
    marginTop: 13,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 20,
  },
  modalClose: {
    alignItems: "center",
    backgroundColor: H2Colors.surface,
    borderRadius: H2Radius.large,
    height: 40,
    justifyContent: "center",
    width: 40,
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
    fontSize: 24,
    marginTop: 6,
  },
  noDeviceOverlay: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  noDeviceText: {
    backgroundColor: "rgba(2, 8, 23, 0.82)",
    borderRadius: H2Radius.medium,
    color: H2Colors.textSecondary,
    fontFamily: H2Fonts.medium,
    fontSize: 12,
    overflow: "hidden",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  pairIdentity: {
    alignItems: "center",
    backgroundColor: H2Colors.surface,
    borderColor: H2Colors.border,
    borderRadius: H2Radius.large,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 32,
    padding: 15,
  },
  pairModel: {
    color: H2Colors.text,
    fontFamily: H2Fonts.semibold,
    fontSize: 14,
  },
  pressed: { opacity: 0.76 },
  safeArea: { backgroundColor: H2Colors.background, flex: 1 },
  saveButton: {
    alignItems: "center",
    backgroundColor: H2Colors.primary,
    borderRadius: H2Radius.large,
    flexDirection: "row",
    gap: 8,
    height: 52,
    justifyContent: "center",
    marginTop: 32,
  },
  saveText: {
    color: H2Colors.background,
    fontFamily: H2Fonts.bold,
    fontSize: 14,
  },
  sectionEyebrow: {
    color: H2Colors.primary,
    fontFamily: H2Fonts.data,
    fontSize: 9,
    textTransform: "uppercase",
  },
  sectionHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 13,
  },
  sectionHeaderConnected: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 36,
  },
  sectionTitle: {
    color: H2Colors.text,
    fontFamily: H2Fonts.semibold,
    fontSize: 18,
    marginTop: 5,
  },
  serial: {
    color: H2Colors.textMuted,
    fontFamily: H2Fonts.data,
    fontSize: 9,
    marginTop: 3,
  },
  signalRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginTop: 6,
  },
  signalText: {
    color: H2Colors.success,
    fontFamily: H2Fonts.data,
    fontSize: 8,
  },
  title: {
    color: H2Colors.text,
    fontFamily: H2Fonts.bold,
    fontSize: 30,
    marginTop: 8,
  },
  valveButton: {
    alignItems: "center",
    backgroundColor: H2Colors.text,
    borderColor: H2Colors.text,
    borderRadius: H2Radius.large,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    height: 52,
    justifyContent: "center",
    marginTop: 18,
  },
  valveButtonClosed: {
    backgroundColor: H2Colors.success,
    borderColor: H2Colors.success,
  },
  valveText: {
    color: H2Colors.white,
    fontFamily: H2Fonts.semibold,
    fontSize: 14,
  },
  warningDot: { backgroundColor: H2Colors.warning },
});
