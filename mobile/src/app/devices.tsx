import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useState } from "react";
import {
  DollarSign,
  Droplets,
  Gauge,
  Leaf,
  ShieldAlert,
  Sparkles,
  Thermometer,
  TrendingUp,
  Waves,
} from "lucide-react-native";

// These are the rooms that users can monitor.
const rooms = [
  { id: "kitchen", label: "Kitchen", x: "75%", y: "50%" },
  { id: "bathroom", label: "Bathroom", x: "40%", y: "50%" },
  { id: "laundry", label: "Laundry", x: "55%", y: "54%" },
  { id: "garden", label: "Garden", x: "14%", y: "62%" },
  { id: "pool", label: "Pool", x: "55%", y: "82%" },
] as const;

// This creates the type:
// "kitchen" | "bathroom" | "laundry" | "garden" | "pool"
type RoomId = (typeof rooms)[number]["id"];

type RoomData = {
  currentFlow: number;
  today: number;
  month: number;
  temperature: number;
  efficiency: number;
  cost: number;
  predicted: number;
  carbon: number;
  risk: string;
};

const roomData: Record<RoomId, RoomData> = {
  kitchen: {
    currentFlow: 4.2,
    today: 38,
    month: 1.14,
    temperature: 22,
    efficiency: 92,
    cost: 9.1,
    predicted: 1.08,
    carbon: 0.31,
    risk: "Low",
  },
  bathroom: {
    currentFlow: 7.8,
    today: 64,
    month: 1.92,
    temperature: 41,
    efficiency: 78,
    cost: 15.3,
    predicted: 2.05,
    carbon: 0.52,
    risk: "Medium",
  },
  laundry: {
    currentFlow: 0,
    today: 19,
    month: 0.57,
    temperature: 24,
    efficiency: 88,
    cost: 4.5,
    predicted: 0.55,
    carbon: 0.16,
    risk: "Low",
  },
  garden: {
    currentFlow: 2.1,
    today: 28,
    month: 0.84,
    temperature: 19,
    efficiency: 95,
    cost: 6.7,
    predicted: 0.8,
    carbon: 0.23,
    risk: "Low",
  },
  pool: {
    currentFlow: 0.4,
    today: 12,
    month: 0.36,
    temperature: 26,
    efficiency: 90,
    cost: 2.9,
    predicted: 0.34,
    carbon: 0.1,
    risk: "Low",
  },
};

export default function DevicesScreen() {
  // The Kitchen is selected when the screen first opens.
  const [activeRoomId, setActiveRoomId] = useState<RoomId>("kitchen");
  // Find the complete room object matching the selected ID.
  const activeRoom = rooms.find((room) => room.id === activeRoomId);
  const selectedData = roomData[activeRoomId];

  const metrics = [
    {
      label: "Current Flow",
      value: `${selectedData.currentFlow} L/min`,
      Icon: Waves,
    },
    {
      label: "Today's Usage",
      value: `${selectedData.today} L`,
      Icon: Droplets,
    },
    {
      label: "Monthly Usage",
      value: `${selectedData.month} kL`,
      Icon: TrendingUp,
    },
    {
      label: "Water Temp",
      value: `${selectedData.temperature}\u00B0C`,
      Icon: Thermometer,
    },
    {
      label: "Efficiency Score",
      value: `${selectedData.efficiency}%`,
      Icon: Gauge,
    },
    {
      label: "Cost (month)",
      value: `$${selectedData.cost.toFixed(2)}`,
      Icon: DollarSign,
    },
    {
      label: "Predicted Usage",
      value: `${selectedData.predicted} kL`,
      Icon: Sparkles,
    },
    {
      label: "Carbon Impact",
      value: `${selectedData.carbon} kg CO\u2082`,
      Icon: Leaf,
    },
    {
      label: "Insurance Risk",
      value: selectedData.risk,
      Icon: ShieldAlert,
    },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>SMART HOME</Text>
      <Text style={styles.title}>Devices</Text>
      <View style={styles.houseVisual}>
        <Image
          source={require("../../assets/images/smart-home.png")}
          style={styles.houseImage}
          resizeMode="cover"
        />

        {/* Slightly darken the image so the markers remain visible. */}
        <View pointerEvents="none" style={styles.imageShade} />

        {rooms.map((room) => {
          const isSelected = room.id === activeRoomId;

          return (
            <Pressable
              key={room.id}
              accessibilityLabel={`Select ${room.label}`}
              onPress={() => setActiveRoomId(room.id)}
              style={[
                styles.roomMarker,
                {
                  left: room.x,
                  top: room.y,
                },
                isSelected && styles.selectedRoomMarker,
              ]}
            >
              <View
                style={[
                  styles.markerDot,
                  isSelected && styles.selectedMarkerDot,
                ]}
              />

              {isSelected ? (
                <Text style={styles.markerLabel}>{room.label}</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      {/* Horizontal scrolling prevents the room buttons becoming cramped. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.roomSelector}
      >
        {rooms.map((room) => {
          const isSelected = room.id === activeRoomId;
          return (
            <Pressable
              key={room.id}
              onPress={() => setActiveRoomId(room.id)}
              style={[
                styles.roomButton,
                isSelected && styles.selectedRoomButton,
              ]}
            >
              <Text
                style={[
                  styles.roomButtonText,
                  isSelected && styles.selectedRoomButtonText,
                ]}
              >
                {room.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {/* This proves that changing the selected room updates the screen. */}
      <View style={styles.roomHeader}>
        <Text style={styles.roomTitle}>{activeRoom?.label}</Text>

        <View style={styles.liveStatus}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        {metrics.map(({ label, value, Icon }, index) => {
          const isLastCard = index === metrics.length - 1;

          return (
            <View
              key={label}
              style={[
                styles.metricCard,
                isLastCard && styles.wideMetricCard,
              ]}
            >
              <View style={styles.metricLabelRow}>
                <Icon color="#22d3ee" size={15} />
                <Text style={styles.metricLabel}>{label}</Text>
              </View>

              <Text style={styles.metricValue}>{value}</Text>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#070d18",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 120,
  },
  eyebrow: {
    color: "#22d3ee",
    fontSize: 11,
    fontWeight: "700",
  },
  title: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "800",
    marginTop: 6,
  },
  roomSelector: {
    gap: 10,
    paddingVertical: 24,
  },
  roomButton: {
    backgroundColor: "rgba(255,255,255,0.07)",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  selectedRoomButton: {
    backgroundColor: "#22d3ee",
  },
  roomButtonText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: "600",
  },
  selectedRoomButtonText: {
    color: "#070d18",
  },
  roomHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  roomTitle: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "800",
  },
  liveStatus: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  liveDot: {
    backgroundColor: "#10b981",
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  liveText: {
    color: "#10b981",
    fontSize: 11,
    fontWeight: "800",
  },
  houseVisual: {
    aspectRatio: 16 / 11,
    borderColor: "rgba(34,211,238,0.22)",
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 24,
    overflow: "hidden",
    position: "relative",
    width: "100%",
  },
  houseImage: {
    height: "100%",
    width: "100%",
  },
  imageShade: {
    backgroundColor: "rgba(7,13,24,0.18)",
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  roomMarker: {
    alignItems: "center",
    backgroundColor: "rgba(7,13,24,0.72)",
    borderColor: "rgba(34,211,238,0.42)",
    borderRadius: 22,
    borderWidth: 2,
    height: 44,
    justifyContent: "center",
    position: "absolute",
    transform: [{ translateX: -22 }, { translateY: -22 }],
    width: 44,
  },
  selectedRoomMarker: {
    backgroundColor: "rgba(34,211,238,0.25)",
    borderColor: "#22d3ee",
  },
  markerDot: {
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 5,
    height: 10,
    width: 10,
  },
  selectedMarkerDot: {
    backgroundColor: "#22d3ee",
  },
  markerLabel: {
    backgroundColor: "rgba(7,13,24,0.9)",
    borderRadius: 5,
    color: "#67e8f9",
    fontSize: 7,
    fontWeight: "800",
    left: -24,
    paddingHorizontal: 6,
    paddingVertical: 4,
    position: "absolute",
    textAlign: "center",
    textTransform: "uppercase",
    top: 48,
    width: 88,
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 20,
  },
  metricCard: {
    backgroundColor: "rgba(4,10,22,0.7)",
    borderColor: "rgba(34,211,238,0.22)",
    borderRadius: 8,
    borderWidth: 1,
    flexBasis: "47%",
    flexGrow: 1,
    minHeight: 104,
    padding: 14,
  },
  wideMetricCard: {
    flexBasis: "100%",
  },
  metricLabelRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
  },
  metricLabel: {
    color: "rgba(34,211,238,0.75)",
    flex: 1,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  metricValue: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 12,
  },
});
