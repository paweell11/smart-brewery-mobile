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

// Konfiguracja skali Wagi (50 do 70)
const WEIGHT_MIN_Y = 50;
// Zakres wartości (70 - 50 = 20)
const WEIGHT_RANGE = 20;
// Etykiety co 2 (50, 52, 54... 70)
const Y_LABELS = [
  "50",
  "52",
  "54",
  "56",
  "58",
  "60",
  "62",
  "64",
  "66",
  "68",
  "70",
];

// Definicja typów zakresów
type RangeType = "1D" | "3D" | "7D" | "2T" | "4T";

// --- POMOCNICZE FUNKCJE DO GENEROWANIA DANYCH ---
const generateWeightMockData = (hours: number, intervalMinutes: number) => {
  const points = [];
  const count = Math.floor((hours * 60) / intervalMinutes);
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const time = new Date(
      now.getTime() - (count - 1 - i) * intervalMinutes * 60000
    );

    // Symulacja spadku wagi (fermentacja)
    // Start ok 65kg, spadek powolny
    const progress = i / count;
    const baseWeight = 65.0 - progress * 2.5; // Spadek o ok 2.5kg w czasie
    const fluctuation = Math.random() * 0.05 - 0.025; // Małe szumy wagi

    points.push({
      timestamp: time,
      value: parseFloat((baseWeight + fluctuation).toFixed(2)),
    });
  }
  return points;
};

const RAW_DATA_1D = generateWeightMockData(24, 30);
const RAW_DATA_3D = generateWeightMockData(72, 60);
const RAW_DATA_7D = generateWeightMockData(168, 120);
const RAW_DATA_2T = generateWeightMockData(336, 240);
const RAW_DATA_4T = generateWeightMockData(672, 360);

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

export default function WeightDetails() {
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

  // Obliczanie Zmiany w wybranym okresie (Teraz - Początek wykresu)
  const startValue = currentRawData[0].value;
  const totalChange = nowValue - startValue;
  const changeStr = `${totalChange >= 0 ? "+" : ""}${totalChange.toFixed(
    2
  )} kg`;

  // Dynamiczna etykieta w zależności od wybranego zakresu
  const getChangeLabel = (range: RangeType) => {
    switch (range) {
      case "1D":
        return "Zmiana (24h)";
      case "3D":
        return "Zmiana (3 dni)";
      case "7D":
        return "Zmiana (7 dni)";
      case "2T":
        return "Zmiana (2 tyg.)";
      case "4T":
        return "Zmiana (4 tyg.)";
      default:
        return "Zmiana";
    }
  };
  const changeLabel = getChangeLabel(selectedRange);

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
          <Text variant="titleLarge">Masa fermentora</Text>
          <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 4 }}>
            Waga - poglądowo
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
                  // --- KONFIGURACJA ZAKRESU 50-70 ---
                  yAxisOffset={WEIGHT_MIN_Y} // Start od 50
                  maxValue={WEIGHT_RANGE} // Zakres 20 (do 70)
                  yAxisLabelTexts={Y_LABELS} // Sztywne etykiety
                  noOfSections={10} // Co 2 stopnie (20 / 2 = 10)
                  // ----------------------------------

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
                              {item.value} kg
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
        <Text>Masa</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>
            Masa (teraz)
          </Text>
          <Text variant="titleMedium">{nowValue.toFixed(2)} kg</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            Ostatni odczyt
          </Text>
        </View>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>
            {changeLabel}
          </Text>
          <Text variant="titleMedium">{changeStr}</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            Δ masy
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
