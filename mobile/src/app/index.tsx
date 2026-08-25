import { useFocusEffect, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BarChart } from "react-native-chart-kit";
import Animated, { FadeInDown } from "react-native-reanimated";
import {
  Activity,
  Cpu,
  Droplets,
  Power,
  ShieldCheck,
  Waves,
} from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  type Device,
  type DeviceReading,
  fetchDeviceReadings,
  fetchDevices,
  fetchDeviceTelemetry,
  setDeviceValve,
} from "@/api/devices";
import { H2Brand } from "@/components/h2-brand";
import { H2Colors, H2Fonts, H2Radius } from "@/constants/theme";

type DeviceSnapshot = {
  device: Device;
  latest: DeviceReading | null;
  litresToday: number;
  litresSevenDays: number;
  litresThisMonth: number;
};

const SYSTEM_SCOPE = "system";

function formatWaterVolume(litres: number) {
  if (litres >= 1000) {
    return `${(litres / 1000).toFixed(litres >= 10_000 ? 0 : 1)} kL`;
  }

  return `${litres.toFixed(1)} L`;
}

function aggregateHistories(histories: DeviceReading[][]) {
  const chronological = histories.map((readings) => [...readings].reverse());
  const longestHistory = Math.max(0, ...chronological.map((items) => items.length));

  return Array.from({ length: longestHistory }, (_, index) => {
    const alignedReadings = chronological.flatMap((readings) => {
      const readingIndex = readings.length - longestHistory + index;
      return readingIndex >= 0 ? [readings[readingIndex]] : [];
    });
    const newestTimestamp = alignedReadings.reduce(
      (newest, reading) =>
        new Date(reading.timestamp).getTime() > new Date(newest).getTime()
          ? reading.timestamp
          : newest,
      alignedReadings[0]?.timestamp ?? new Date().toISOString(),
    );

    return {
      id: `system-${index}`,
      deviceId: SYSTEM_SCOPE,
      deviceName: "Whole system",
      flowLpm: alignedReadings.reduce((sum, reading) => sum + reading.flowLpm, 0),
      pressureBar: null,
      temperatureC: null,
      timestamp: newestTimestamp,
    } satisfies DeviceReading;
  });
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Could not refresh your home.";
}

export default function HomeScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const [snapshots, setSnapshots] = useState<DeviceSnapshot[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState(SYSTEM_SCOPE);
  const [historyByDevice, setHistoryByDevice] = useState<
    Record<string, DeviceReading[]>
  >({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [shuttingOff, setShuttingOff] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedSnapshot = useMemo(
    () => snapshots.find(({ device }) => device.id === selectedDeviceId),
    [selectedDeviceId, snapshots],
  );
  const systemHistory = useMemo(
    () => aggregateHistories(Object.values(historyByDevice)),
    [historyByDevice],
  );
  const history = useMemo(
    () =>
      selectedDeviceId === SYSTEM_SCOPE
        ? systemHistory
        : [...(historyByDevice[selectedDeviceId] ?? [])].reverse(),
    [historyByDevice, selectedDeviceId, systemHistory],
  );

  const loadDashboard = useCallback(async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    }

    try {
      const devices = await fetchDevices();
      const nextSnapshots = await Promise.all(
        devices.map(async (device) => {
          const telemetry = await fetchDeviceTelemetry(device.id);

          return {
            device,
            latest: telemetry.latest,
            litresToday: telemetry.usage.litresToday,
            litresSevenDays: telemetry.usage.litresSevenDays,
            litresThisMonth: telemetry.usage.litresThisMonth,
          };
        }),
      );
      setSnapshots(nextSnapshots);
      setSelectedDeviceId((current) => {
        if (current === SYSTEM_SCOPE) {
          return current;
        }

        if (current && devices.some((device) => device.id === current)) {
          return current;
        }

        return SYSTEM_SCOPE;
      });
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
      const interval = setInterval(() => void loadDashboard(), 15_000);

      return () => clearInterval(interval);
    }, [loadDashboard]),
  );

  useEffect(() => {
    if (snapshots.length === 0) {
      return undefined;
    }

    let active = true;

    async function loadHistory() {
      try {
        const histories = await Promise.all(
          snapshots.map(async ({ device }) => [
            device.id,
            await fetchDeviceReadings(device.id, 36),
          ] as const),
        );

        if (active) {
          setHistoryByDevice(Object.fromEntries(histories));
        }
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError));
        }
      }
    }

    void loadHistory();
    return () => {
      active = false;
    };
  }, [snapshots]);

  const totalCurrentFlow = snapshots.reduce(
    (sum, snapshot) => sum + (snapshot.latest?.flowLpm ?? 0),
    0,
  );
  const totalToday = snapshots.reduce(
    (sum, snapshot) => sum + snapshot.litresToday,
    0,
  );
  const totalSevenDays = snapshots.reduce(
    (sum, snapshot) => sum + snapshot.litresSevenDays,
    0,
  );
  const totalThisMonth = snapshots.reduce(
    (sum, snapshot) => sum + snapshot.litresThisMonth,
    0,
  );
  const onlineDevices = snapshots.filter(
    ({ device }) => device.status === "online",
  ).length;
  const openValves = snapshots.filter(({ device }) => device.is_on).length;
  const systemHealthy =
    snapshots.length > 0 && onlineDevices === snapshots.length;
  const averageFlow =
    systemHistory.length > 0
      ? systemHistory.reduce((sum, reading) => sum + reading.flowLpm, 0) /
        systemHistory.length
      : 0;
  const peakFlow = Math.max(
    0,
    ...systemHistory.map((reading) => reading.flowLpm),
  );
  const monthlyEstimate = totalToday * 30;
  const annualEstimate = totalToday * 365;

  const insight =
    snapshots.length === 0
      ? "No monitor is connected to this home."
      : totalCurrentFlow === 0
        ? "No water is flowing through your connected monitors right now."
        : totalCurrentFlow > 12
          ? "Current household flow is higher than the usual daytime range."
          : "Water flow is within the normal household range.";

  const chartReadings = history.length > 0 ? history : [];
  const chartData = {
    labels: chartReadings.map((item, index) =>
      index % 4 === 0
        ? new Date(item.timestamp).toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          })
        : "",
    ),
    datasets: [
      {
        data:
          chartReadings.length > 0
            ? chartReadings.map((item) => item.flowLpm)
            : [0],
      },
    ],
  };
  const chartWidth = Math.max(width - 42, chartReadings.length * 28);

  function confirmEmergencyShutoff() {
    const devicesToClose = snapshots.filter(({ device }) => device.is_on);

    if (devicesToClose.length === 0) {
      Alert.alert("Valves already closed", "No connected valve is currently open.");
      return;
    }

    Alert.alert(
      "Close every main valve?",
      `${devicesToClose.length} connected valve${devicesToClose.length === 1 ? "" : "s"} will stop water flow.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Close valves",
          style: "destructive",
          onPress: () => void handleEmergencyShutoff(devicesToClose),
        },
      ],
    );
  }

  async function handleEmergencyShutoff(devicesToClose: DeviceSnapshot[]) {
    setShuttingOff(true);

    try {
      await Promise.all(
        devicesToClose.map(({ device }) => setDeviceValve(device.id, false)),
      );
      await loadDashboard();
      setError(null);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setShuttingOff(false);
    }
  }

  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            onRefresh={() => void loadDashboard(true)}
            refreshing={refreshing}
            tintColor={H2Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <H2Brand />
          <View style={styles.systemBadge}>
            <View
              style={[
                styles.systemDot,
                !systemHealthy && styles.systemDotWarning,
              ]}
            />
            <Text
              style={[
                styles.systemText,
                !systemHealthy && styles.systemTextWarning,
              ]}
            >
              {systemHealthy ? "System online" : "Needs attention"}
            </Text>
          </View>
        </View>

        <View style={styles.heading}>
          <Text style={styles.eyebrow}>Whole-home overview</Text>
          <Text style={styles.title}>Your water, live.</Text>
          <Text style={styles.description}>
            A current view of every connected H2 monitor.
          </Text>
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {loading ? (
          <View style={styles.loadingBlock}>
            <ActivityIndicator color={H2Colors.primary} size="large" />
          </View>
        ) : snapshots.length === 0 ? (
          <View style={styles.emptyState}>
            <Cpu color={H2Colors.primary} size={28} />
            <Text style={styles.emptyTitle}>No connected monitor</Text>
            <Pressable
              onPress={() => router.push("/devices")}
              style={styles.primaryButton}
            >
              <Text style={styles.primaryButtonText}>Open devices</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <Animated.View
              entering={FadeInDown.delay(80).duration(460).springify().damping(18)}
              style={styles.flowHero}
            >
              <View>
                <Text style={styles.flowLabel}>Live household flow</Text>
                <View style={styles.flowValueRow}>
                  <Text style={styles.flowValue}>{totalCurrentFlow.toFixed(2)}</Text>
                  <Text style={styles.flowUnit}>L/min</Text>
                </View>
              </View>
              <View style={styles.flowIcon}>
                <View style={styles.flowPulse} />
                <Waves color={H2Colors.white} size={26} />
              </View>
            </Animated.View>

            <View style={styles.insightRow}>
              <Activity color={H2Colors.primary} size={17} />
              <Text style={styles.insightText}>{insight}</Text>
            </View>

            <View style={styles.flowBreakdownHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>Current flow</Text>
                <Text style={styles.sectionTitle}>All devices</Text>
              </View>
              <Text style={styles.updatedText}>Live</Text>
            </View>

            <View style={styles.flowBreakdown}>
              {snapshots.map((snapshot, index) => {
                const flow = snapshot.latest?.flowLpm ?? 0;
                const share = totalCurrentFlow > 0 ? (flow / totalCurrentFlow) * 100 : 0;

                return (
                  <Pressable
                    key={snapshot.device.id}
                    onPress={() => setSelectedDeviceId(snapshot.device.id)}
                    style={[
                      styles.flowDeviceRow,
                      index > 0 && styles.flowDeviceBorder,
                    ]}
                  >
                    <View style={styles.flowDeviceTopRow}>
                      <View style={styles.flowDeviceIdentity}>
                        <View
                          style={[
                            styles.chipDot,
                            snapshot.device.status !== "online" && styles.flowDeviceWarning,
                          ]}
                        />
                        <View style={styles.flowDeviceCopy}>
                          <Text numberOfLines={1} style={styles.flowDeviceName}>
                            {snapshot.device.name}
                          </Text>
                          <Text numberOfLines={1} style={styles.flowDeviceLocation}>
                            {snapshot.device.location ?? "No location"}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.flowDeviceValueRow}>
                        <Text style={styles.flowDeviceValue}>{flow.toFixed(2)}</Text>
                        <Text style={styles.flowDeviceUnit}>L/min</Text>
                      </View>
                    </View>
                    <View style={styles.flowTrack}>
                      <View
                        style={[
                          styles.flowTrackValue,
                          { width: `${Math.max(flow > 0 ? 4 : 0, share)}%` },
                        ]}
                      />
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <ScrollView
              contentContainerStyle={styles.deviceSelector}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <Pressable
                onPress={() => setSelectedDeviceId(SYSTEM_SCOPE)}
                style={[
                  styles.deviceChip,
                  selectedDeviceId === SYSTEM_SCOPE && styles.deviceChipSelected,
                ]}
              >
                <Waves
                  color={
                    selectedDeviceId === SYSTEM_SCOPE
                      ? H2Colors.background
                      : H2Colors.primary
                  }
                  size={14}
                />
                <Text
                  style={[
                    styles.deviceChipText,
                    selectedDeviceId === SYSTEM_SCOPE &&
                      styles.deviceChipTextSelected,
                  ]}
                >
                  Whole system
                </Text>
              </Pressable>
              {snapshots.map(({ device }) => {
                const selected = device.id === selectedDeviceId;

                return (
                  <Pressable
                    key={device.id}
                    onPress={() => setSelectedDeviceId(device.id)}
                    style={[
                      styles.deviceChip,
                      selected && styles.deviceChipSelected,
                    ]}
                  >
                    <View style={styles.chipDot} />
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

            <View style={styles.chartHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>Flow history</Text>
                <Text style={styles.sectionTitle}>
                  {selectedSnapshot?.device.name ?? "Whole system"}
                </Text>
              </View>
              <Text style={styles.updatedText}>
                {chartReadings.length} readings
              </Text>
            </View>

            <View style={styles.chartFrame}>
              <ScrollView
                contentContainerStyle={styles.chartScrollContent}
                contentOffset={{ x: Math.max(0, chartWidth - (width - 42)), y: 0 }}
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
              >
                <BarChart
                  data={chartData}
                  width={chartWidth}
                  height={210}
                  yAxisLabel=""
                  yAxisSuffix=""
                  fromZero
                  showValuesOnTopOfBars={false}
                  withInnerLines
                  chartConfig={{
                    backgroundColor: H2Colors.surface,
                    backgroundGradientFrom: H2Colors.surface,
                    backgroundGradientTo: H2Colors.surface,
                    barPercentage: 0.58,
                    color: () => H2Colors.primary,
                    decimalPlaces: 1,
                    labelColor: () => H2Colors.textMuted,
                    propsForBackgroundLines: {
                      stroke: H2Colors.borderSoft,
                    },
                    propsForLabels: {
                      fontFamily: H2Fonts.data,
                      fontSize: 8,
                    },
                  }}
                  style={styles.chart}
                />
              </ScrollView>
            </View>

            <View style={styles.summaryHeader}>
              <View>
                <Text style={styles.sectionEyebrow}>Water report</Text>
                <Text style={styles.sectionTitle}>Usage summary</Text>
              </View>
              <Text style={styles.updatedText}>Whole system</Text>
            </View>

            <View style={styles.statsGrid}>
              <Metric
                icon={Droplets}
                label="Today's usage"
                value={formatWaterVolume(totalToday)}
              />
              <Metric
                icon={Activity}
                label="Last 7 days"
                value={formatWaterVolume(totalSevenDays)}
              />
              <Metric
                icon={Waves}
                label="This month"
                value={formatWaterVolume(totalThisMonth)}
              />
              <Metric
                icon={Waves}
                label="30-day forecast"
                value={formatWaterVolume(monthlyEstimate)}
              />
              <Metric
                icon={Droplets}
                label="Annual forecast"
                value={formatWaterVolume(annualEstimate)}
              />
              <Metric
                icon={Activity}
                label="Average flow"
                value={`${averageFlow.toFixed(2)} L/min`}
              />
              <Metric
                icon={Waves}
                label="Peak flow"
                value={`${peakFlow.toFixed(2)} L/min`}
              />
              <Metric
                icon={Cpu}
                label="Online devices"
                value={`${onlineDevices}/${snapshots.length}`}
              />
              <Metric
                icon={Power}
                label="Open valves"
                value={String(openValves)}
              />
              <Metric
                icon={ShieldCheck}
                label="Protection"
                value={systemHealthy ? "Active" : "Check"}
              />
            </View>

            <Pressable
              disabled={shuttingOff}
              onPress={confirmEmergencyShutoff}
              style={styles.shutoffButton}
            >
              {shuttingOff ? (
                <ActivityIndicator color={H2Colors.white} size="small" />
              ) : (
                <Power color={H2Colors.white} size={18} />
              )}
              <Text style={styles.shutoffText}>Emergency shut-off</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

type MetricProps = {
  icon: typeof Droplets;
  label: string;
  value: string;
};

function Metric({ icon: Icon, label, value }: MetricProps) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricLabelRow}>
        <Icon color={H2Colors.primary} size={15} />
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  chart: { borderRadius: H2Radius.large, marginLeft: -8 },
  chartFrame: {
    backgroundColor: H2Colors.surface,
    borderColor: H2Colors.border,
    borderRadius: H2Radius.large,
    borderWidth: 1,
    marginTop: 14,
    overflow: "hidden",
  },
  chartScrollContent: { minWidth: "100%" },
  chartHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  chipDot: {
    backgroundColor: H2Colors.success,
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  content: {
    paddingBottom: 120,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  description: {
    color: H2Colors.textSecondary,
    fontFamily: H2Fonts.regular,
    fontSize: 14,
    marginTop: 8,
  },
  deviceChip: {
    alignItems: "center",
    backgroundColor: H2Colors.surface,
    borderColor: H2Colors.border,
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
  deviceSelector: { gap: 9, paddingVertical: 22 },
  emptyState: {
    alignItems: "center",
    borderColor: H2Colors.border,
    borderRadius: H2Radius.large,
    borderWidth: 1,
    gap: 14,
    padding: 36,
  },
  emptyTitle: {
    color: H2Colors.text,
    fontFamily: H2Fonts.semibold,
    fontSize: 17,
  },
  errorBanner: {
    backgroundColor: "rgba(251, 191, 36, 0.1)",
    borderColor: "rgba(251, 191, 36, 0.3)",
    borderRadius: H2Radius.large,
    borderWidth: 1,
    marginBottom: 18,
    padding: 12,
  },
  errorText: {
    color: H2Colors.warning,
    fontFamily: H2Fonts.regular,
    fontSize: 12,
  },
  eyebrow: {
    color: H2Colors.primary,
    fontFamily: H2Fonts.data,
    fontSize: 10,
    textTransform: "uppercase",
  },
  flowHero: {
    alignItems: "center",
    backgroundColor: H2Colors.text,
    borderRadius: H2Radius.large,
    flexDirection: "row",
    justifyContent: "space-between",
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingVertical: 22,
    shadowColor: H2Colors.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
  },
  flowBreakdown: {
    backgroundColor: H2Colors.surface,
    borderColor: H2Colors.border,
    borderRadius: H2Radius.large,
    borderWidth: 1,
    overflow: "hidden",
  },
  flowBreakdownHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 11,
    marginTop: 24,
  },
  flowDeviceBorder: {
    borderTopColor: H2Colors.borderSoft,
    borderTopWidth: 1,
  },
  flowDeviceCopy: { flex: 1, marginLeft: 8 },
  flowDeviceIdentity: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    minWidth: 0,
  },
  flowDeviceLocation: {
    color: H2Colors.textMuted,
    fontFamily: H2Fonts.regular,
    fontSize: 10,
    marginTop: 3,
  },
  flowDeviceName: {
    color: H2Colors.text,
    fontFamily: H2Fonts.medium,
    fontSize: 13,
  },
  flowDeviceRow: { minHeight: 74, paddingHorizontal: 14, paddingVertical: 12 },
  flowDeviceTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  flowDeviceUnit: {
    color: H2Colors.textMuted,
    fontFamily: H2Fonts.data,
    fontSize: 8,
    marginBottom: 2,
  },
  flowDeviceValue: {
    color: H2Colors.text,
    fontFamily: H2Fonts.bold,
    fontSize: 17,
  },
  flowDeviceValueRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 4,
    marginLeft: 12,
  },
  flowDeviceWarning: { backgroundColor: H2Colors.warning },
  flowTrack: {
    backgroundColor: H2Colors.surfaceRaised,
    borderRadius: 2,
    height: 4,
    marginTop: 10,
    overflow: "hidden",
  },
  flowTrackValue: {
    backgroundColor: H2Colors.primary,
    borderRadius: 2,
    height: "100%",
  },
  flowIcon: {
    alignItems: "center",
    backgroundColor: H2Colors.primary,
    borderRadius: H2Radius.large,
    height: 58,
    justifyContent: "center",
    overflow: "hidden",
    width: 58,
  },
  flowPulse: {
    backgroundColor: H2Colors.aqua,
    bottom: -18,
    height: 34,
    opacity: 0.35,
    position: "absolute",
    transform: [{ rotate: "-8deg" }],
    width: 80,
  },
  flowLabel: {
    color: "rgba(255, 255, 255, 0.62)",
    fontFamily: H2Fonts.data,
    fontSize: 10,
    textTransform: "uppercase",
  },
  flowUnit: {
    color: H2Colors.aqua,
    fontFamily: H2Fonts.data,
    fontSize: 13,
    marginBottom: 7,
  },
  flowValue: {
    color: H2Colors.white,
    fontFamily: H2Fonts.bold,
    fontSize: 42,
  },
  flowValueRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  heading: { marginBottom: 28, marginTop: 34 },
  insightRow: {
    alignItems: "flex-start",
    backgroundColor: H2Colors.surface,
    borderColor: H2Colors.border,
    borderRadius: H2Radius.large,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    padding: 14,
  },
  insightText: {
    color: H2Colors.textSecondary,
    flex: 1,
    fontFamily: H2Fonts.regular,
    fontSize: 13,
    lineHeight: 19,
  },
  loadingBlock: { paddingVertical: 70 },
  metricCard: {
    backgroundColor: H2Colors.surface,
    borderColor: H2Colors.border,
    borderRadius: H2Radius.large,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    minHeight: 98,
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
    fontSize: 20,
    marginTop: 14,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  summaryHeader: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  primaryButton: {
    backgroundColor: H2Colors.primary,
    borderRadius: H2Radius.large,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: H2Colors.background,
    fontFamily: H2Fonts.semibold,
    fontSize: 13,
  },
  safeArea: { backgroundColor: H2Colors.background, flex: 1 },
  sectionEyebrow: {
    color: H2Colors.primary,
    fontFamily: H2Fonts.data,
    fontSize: 9,
    textTransform: "uppercase",
  },
  sectionTitle: {
    color: H2Colors.text,
    fontFamily: H2Fonts.semibold,
    fontSize: 17,
    marginTop: 5,
  },
  shutoffButton: {
    alignItems: "center",
    backgroundColor: H2Colors.text,
    borderColor: H2Colors.text,
    borderRadius: H2Radius.large,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    height: 52,
    justifyContent: "center",
    marginTop: 18,
  },
  shutoffText: {
    color: H2Colors.white,
    fontFamily: H2Fonts.semibold,
    fontSize: 14,
  },
  systemBadge: {
    alignItems: "center",
    backgroundColor: "rgba(52, 211, 153, 0.09)",
    borderColor: "rgba(52, 211, 153, 0.25)",
    borderRadius: H2Radius.large,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 32,
    paddingHorizontal: 10,
  },
  systemDot: {
    backgroundColor: H2Colors.success,
    borderRadius: 4,
    height: 7,
    width: 7,
  },
  systemDotWarning: { backgroundColor: H2Colors.warning },
  systemText: {
    color: H2Colors.success,
    fontFamily: H2Fonts.data,
    fontSize: 9,
    textTransform: "uppercase",
  },
  systemTextWarning: { color: H2Colors.warning },
  title: {
    color: H2Colors.text,
    fontFamily: H2Fonts.bold,
    fontSize: 30,
    marginTop: 8,
  },
  updatedText: {
    color: H2Colors.textMuted,
    fontFamily: H2Fonts.data,
    fontSize: 9,
  },
});
