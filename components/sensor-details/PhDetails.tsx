import * as React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Text, useTheme } from "react-native-paper";

// --- KONFIGURACJA WYKRESU ---
const Y_LABEL_W = 40;
const LEFT_PAD = 10;
const CHART_H = 220;
// Stała do korekty szerokości ScrollView
const CONTAINER_PAD = 100;
const SAFE_RIGHT_MARGIN = 0;
const BG_RIGHT_EXTEND = 40;

// Konfiguracja skali pH (3 do 7)
const PH_MIN_Y = 3;
// Zakres wartości (7 - 3 = 4)
const PH_RANGE = 4;
// Etykiety co 0.5
const Y_LABELS = ["3", "3.5", "4", "4.5", "5", "5.5", "6", "6.5", "7"];

// Definicja typów zakresów
type RangeType = "1D" | "3D" | "7D" | "2T" | "4T";

// --- POMOCNICZE FUNKCJE DO GENEROWANIA DANYCH ---
const generatePhMockData = (hours: number, intervalMinutes: number) => {
  const points = [];
  const count = Math.floor((hours * 60) / intervalMinutes);
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const time = new Date(
      now.getTime() - (count - 1 - i) * intervalMinutes * 60000
    );

    const progress = i / count;
    const basePh = 5.6 - progress * 1.4;
    const fluctuation = Math.random() * 0.1 - 0.05;

    points.push({
      timestamp: time,
      value: parseFloat((basePh + fluctuation).toFixed(2)),
    });
  }
  return points;
};

const RAW_DATA_1D = generatePhMockData(24, 30);
const RAW_DATA_3D = generatePhMockData(72, 60);
const RAW_DATA_7D = generatePhMockData(168, 120);
const RAW_DATA_2T = generatePhMockData(336, 240);
const RAW_DATA_4T = generatePhMockData(672, 360);

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
  rawData: { timestamp: Date; value: number }[],
  range: RangeType,
  spacing: number
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

    return {
      value: item.value,
      timestamp: item.timestamp,
      labelComponent: labelComponent,
    };
  });
};

export default function PhDetails() {
  const theme = useTheme();
  const [w, setW] = React.useState(0);
  const [selectedRange, setSelectedRange] = React.useState<RangeType>("1D");

  const spacing = selectedRange === "1D" ? 20 : 12;

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
    () => prepareDataForChart(currentRawData, selectedRange, spacing),
    [currentRawData, selectedRange, spacing]
  );

  const nowValue = currentRawData[currentRawData.length - 1].value;
  const prevIndex = Math.max(0, currentRawData.length - 3);
  const prevValue = currentRawData[prevIndex].value;
  const trend = nowValue - prevValue;
  const trendStr = `${trend >= 0 ? "+" : ""}${trend.toFixed(2)}`;

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
          <Text variant="titleLarge">pH fermentacji</Text>
          <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 4 }}>
            Wskaźnik pH
          </Text>
        </View>
      </View>

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
              // Wrapper z Z-Index i Overflow: Visible - KLUCZOWE dla widoczności tooltipa
              <View style={{ zIndex: 10, elevation: 10, overflow: "visible" }}>
                <LineChart
                  key={`${w}-${selectedRange}`}
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
                  color={theme.colors.primary}
                  yAxisOffset={PH_MIN_Y}
                  maxValue={PH_RANGE}
                  yAxisLabelTexts={Y_LABELS}
                  noOfSections={Y_LABELS.length - 1}
                  scrollToEnd
                  scrollAnimation={false}
                  hideDataPoints={true}
                  // Konfiguracja tooltipa identyczna jak w index.tsx
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
                              pH: {item.value}
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
        <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
        <Text>pH</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>
            pH (teraz)
          </Text>
          <Text variant="titleMedium">{nowValue.toFixed(2)}</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            Ostatni odczyt
          </Text>
        </View>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>
            Trend (1h)
          </Text>
          <Text variant="titleMedium">{trendStr}</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            Δ pH
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
