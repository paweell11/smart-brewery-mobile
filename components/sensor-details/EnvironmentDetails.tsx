import * as React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { SegmentedButtons, Text, useTheme } from "react-native-paper";

// --- KONFIGURACJA WYKRESU ---
const Y_LABEL_W = 40;
const LEFT_PAD = 10;
const CHART_H = 220;
// Stała do korekty szerokości ScrollView
const CONTAINER_PAD = 100;
const SAFE_RIGHT_MARGIN = 0;
const BG_RIGHT_EXTEND = 40;

// Konfiguracja osi Y
// Wilgotność 0-100 co 10
const HUMIDITY_LABELS = [
  "0",
  "10",
  "20",
  "30",
  "40",
  "50",
  "60",
  "70",
  "80",
  "90",
  "100",
];
const HUMIDITY_MAX = 100;
const HUMIDITY_SECTIONS = 10;

// Ciśnienie 980-1040 co 10
const PRESSURE_LABELS = ["980", "990", "1000", "1010", "1020", "1030", "1040"];
const PRESSURE_OFFSET = 980;
const PRESSURE_RANGE = 60; // 1040 - 980
const PRESSURE_SECTIONS = 6;

// Definicja typów zakresów
type RangeType = "1D" | "3D" | "7D" | "2T" | "4T";

// --- POMOCNICZE FUNKCJE DO GENEROWANIA DANYCH ---
const generateEnvMockData = (hours: number, intervalMinutes: number) => {
  const points = [];
  const count = Math.floor((hours * 60) / intervalMinutes);
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const time = new Date(
      now.getTime() - (count - 1 - i) * intervalMinutes * 60000
    );

    // Symulacja wilgotności (40-60%)
    const humBase = 50;
    const humFluct = Math.sin(i / 15) * 10 + Math.random() * 2;

    // Symulacja ciśnienia (995-1025)
    const pressBase = 1010;
    const pressFluct = Math.cos(i / 30) * 15 + Math.random() * 1;

    points.push({
      timestamp: time,
      humidity: parseFloat((humBase + humFluct).toFixed(1)),
      pressure: Math.round(pressBase + pressFluct),
    });
  }
  return points;
};

const RAW_DATA_1D = generateEnvMockData(24, 30);
const RAW_DATA_3D = generateEnvMockData(72, 60);
const RAW_DATA_7D = generateEnvMockData(168, 120);
const RAW_DATA_2T = generateEnvMockData(336, 240);
const RAW_DATA_4T = generateEnvMockData(672, 360);

// --- FORMATOWANIE DATY ---
const formatDateTime = (date: Date) => {
  const d = date.getDate().toString().padStart(2, "0");
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const h = date.getHours().toString().padStart(2, "0");
  const min = date.getMinutes().toString().padStart(2, "0");
  return {
    dateStr: `${d}.${m}`,
    timeStr: `${h}:${min}`,
    full: `${d}.${m} ${h}:${min}`,
  };
};

// --- LOGIKA PRZYGOTOWANIA DANYCH ---
const prepareDataForChart = (
  rawData: { timestamp: Date; humidity: number; pressure: number }[],
  range: RangeType,
  spacing: number,
  mode: "humidity" | "pressure"
) => {
  const labelWidth = 60;
  const labelShift = spacing / 2 - labelWidth / 2;

  return rawData.map((item, index) => {
    let showLabel = false;
    if (range === "1D") {
      if (index % 4 === 0) showLabel = true;
    } else {
      if (index % 6 === 0) showLabel = true;
    }

    let labelComponent = undefined;

    if (showLabel) {
      const { dateStr, timeStr } = formatDateTime(item.timestamp);
      labelComponent = () => (
        <View
          style={{
            width: labelWidth,
            marginLeft: labelShift,
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 9, opacity: 0.8, fontWeight: "bold" }}>
            {dateStr}
          </Text>
          <Text style={{ fontSize: 9, opacity: 0.6 }}>{timeStr}</Text>
        </View>
      );
    }

    const val = mode === "humidity" ? item.humidity : item.pressure;

    return {
      value: val,
      timestamp: item.timestamp,
      labelComponent: labelComponent,
    };
  });
};

export default function EnvironmentDetails() {
  const theme = useTheme();
  const [w, setW] = React.useState(0);
  const [mode, setMode] = React.useState<"humidity" | "pressure">("humidity");
  const [selectedRange, setSelectedRange] = React.useState<RangeType>("1D");

  const spacing = selectedRange === "1D" ? 20 : 12;

  // Kolory
  const humidityColor = theme.colors.primary;
  const pressureColor = theme.colors.tertiary;
  const currentColor = mode === "humidity" ? humidityColor : pressureColor;

  let currentRawData;
  switch (selectedRange) {
    case "1D":
      currentRawData = RAW_DATA_1D;
      break;
    case "3D":
      currentRawData = RAW_DATA_3D;
      break;
    case "7D":
      currentRawData = RAW_DATA_7D;
      break;
    case "2T":
      currentRawData = RAW_DATA_2T;
      break;
    case "4T":
      currentRawData = RAW_DATA_4T;
      break;
    default:
      currentRawData = RAW_DATA_1D;
  }

  const chartData = React.useMemo(
    () => prepareDataForChart(currentRawData, selectedRange, spacing, mode),
    [currentRawData, selectedRange, spacing, mode]
  );

  // Statystyki "Teraz"
  const lastItem = currentRawData[currentRawData.length - 1];
  const nowHum = lastItem.humidity;
  const nowPress = lastItem.pressure;

  const comfortLabel =
    nowHum < 30 ? "Poniżej" : nowHum > 60 ? "Powyżej" : "W zakresie";

  // Konfiguracja osi Y
  const isHum = mode === "humidity";
  const yLabels = isHum ? HUMIDITY_LABELS : PRESSURE_LABELS;
  const sections = isHum ? HUMIDITY_SECTIONS : PRESSURE_SECTIONS;
  const maxVal = isHum ? HUMIDITY_MAX : PRESSURE_RANGE;
  const yOffset = isHum ? 0 : PRESSURE_OFFSET;

  return (
    <ScrollView
      style={[styles.wrap, { marginHorizontal: -CONTAINER_PAD }]}
      contentContainerStyle={{
        paddingHorizontal: CONTAINER_PAD,
        paddingBottom: 20,
      }}
      onLayout={(e) => {
        const width = e.nativeEvent.layout.width;
        if (width > 0 && Math.abs(w - width) > 1) {
          setW(width);
        }
      }}
    >
      <View style={styles.headerRow}>
        <View>
          <Text variant="titleLarge">Warunki otoczenia</Text>
          <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 4 }}>
            {mode === "humidity"
              ? "Wilgotność względna"
              : "Ciśnienie atmosferyczne"}
          </Text>
        </View>
      </View>

      {/* Przełącznik trybu */}
      <SegmentedButtons
        value={mode}
        onValueChange={(v) => setMode(v as any)}
        style={{ marginTop: 10, marginBottom: 10 }}
        buttons={[
          { value: "humidity", label: "Wilgotność" },
          { value: "pressure", label: "Ciśnienie" },
        ]}
      />

      <View style={styles.rangeContainer}>
        {(["1D", "3D", "7D", "2T", "4T"] as const).map((range) => {
          const isActive = selectedRange === range;
          return (
            <TouchableOpacity
              key={range}
              onPress={() => setSelectedRange(range)}
              style={[
                styles.rangeButton,
                { backgroundColor: theme.colors.surfaceVariant },
                isActive && { backgroundColor: theme.colors.primaryContainer },
              ]}
            >
              <Text
                style={[
                  styles.rangeText,
                  { color: theme.colors.onSurfaceVariant },
                  isActive && {
                    color: theme.colors.onPrimaryContainer,
                    fontWeight: "bold",
                  },
                ]}
              >
                {range}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {w > 0 && (
        <View
          style={{
            marginTop: 20,
            position: "relative",
            overflow: "visible",
            width: "100%",
          }}
        >
          {(() => {
            const chartWidth = w - 2 * CONTAINER_PAD - SAFE_RIGHT_MARGIN;

            return (
              <View style={{ zIndex: 10, elevation: 10, overflow: "visible" }}>
                <LineChart
                  key={`${w}-${selectedRange}-${mode}`}
                  width={chartWidth}
                  height={CHART_H}
                  data={chartData}
                  spacing={spacing}
                  curved
                  thickness={3}
                  hideRules={false}
                  yAxisLabelWidth={Y_LABEL_W}
                  initialSpacing={LEFT_PAD}
                  endSpacing={5}
                  yAxisColor={theme.colors.outlineVariant}
                  xAxisColor={theme.colors.outlineVariant}
                  yAxisTextStyle={{
                    opacity: 0.7,
                    color: theme.colors.onSurface,
                  }}
                  xAxisLabelTextStyle={{
                    opacity: 0.7,
                    color: theme.colors.onSurface,
                  }}
                  color={currentColor}
                  // Skala
                  yAxisOffset={yOffset}
                  maxValue={maxVal}
                  yAxisLabelTexts={yLabels}
                  noOfSections={sections}
                  scrollToEnd
                  scrollAnimation={false}
                  hideDataPoints={true}
                  pointerConfig={{
                    pointerStripHeight: CHART_H,
                    pointerStripColor: theme.colors.outlineVariant,
                    pointerStripWidth: 2,
                    pointerColor: theme.colors.primary,
                    radius: 4,
                    pointerLabelWidth: 100,
                    pointerLabelHeight: 60,
                    activatePointersOnLongPress: true,
                    autoAdjustPointerLabelPosition: false,
                    shiftPointerLabelY: 45,

                    pointerLabelComponent: (items: any) => {
                      const item = items[0];
                      const { full } = formatDateTime(item.timestamp);
                      const unit = mode === "humidity" ? "%" : " hPa";

                      return (
                        <View
                          style={{
                            height: 60,
                            width: 100,
                            justifyContent: "flex-end",
                            alignItems: "center",
                          }}
                        >
                          <View
                            style={{
                              backgroundColor: theme.colors.inverseSurface,
                              borderRadius: 8,
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                            }}
                          >
                            <Text
                              style={{
                                color: theme.colors.inverseOnSurface,
                                fontWeight: "bold",
                                fontSize: 14,
                                textAlign: "center",
                              }}
                            >
                              {item.value}
                              {unit}
                            </Text>
                            <Text
                              style={{
                                color: theme.colors.inverseOnSurface,
                                fontSize: 10,
                                textAlign: "center",
                              }}
                            >
                              {full}
                            </Text>
                          </View>
                        </View>
                      );
                    },
                  }}
                />
              </View>
            );
          })()}
        </View>
      )}

      <View style={{ alignItems: "center", marginTop: 8 }}>
        <Text variant="labelSmall" style={{ opacity: 0.5 }}>
          Przytrzymaj wykres, aby sprawdzić punkt
        </Text>
      </View>

      <View style={styles.legend}>
        <View style={[styles.dot, { backgroundColor: currentColor }]} />
        <Text>{mode === "humidity" ? "Wilgotność" : "Ciśnienie"}</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>
            Wilgotność (teraz)
          </Text>
          <Text variant="titleMedium">{nowHum}%</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            Czujnik
          </Text>
        </View>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>
            Ciśnienie (teraz)
          </Text>
          <Text variant="titleMedium">{nowPress} hPa</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            Barometr
          </Text>
        </View>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>
            Komfort
          </Text>
          <Text variant="titleMedium">{comfortLabel}</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            zakres 30–60%
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  headerRow: {
    marginBottom: 8,
  },
  rangeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 8,
    gap: 8,
  },
  rangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  rangeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  dot: { width: 10, height: 10, borderRadius: 6, marginRight: 6 },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  col: {
    flexGrow: 1,
    minWidth: 100,
  },
});
