import * as React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Text, useTheme } from "react-native-paper";

// --- KONFIGURACJA WYKRESU ---
const Y_LABEL_W = 40;
const LEFT_PAD = 10;
const FIXED_MAX = 30;
const CHART_H = 220;
const Y_LABELS = ["0", "5", "10", "15", "20", "25", "30"].map((v) => `${v}°`);

// --- KONFIGURACJA ZAKRESÓW ---
const TARGET_MIN = 16;
const TARGET_MAX = 24;
// Kalibracja tła
const BG_TOP_SHIFT = 10;
const BG_HEIGHT_CORRECTION = 0;
const BG_RIGHT_EXTEND = 40;
const SAFE_RIGHT_MARGIN = 0; // Margines, żeby ostatnia etykieta się nie ucinała

// --- POMOCNICZE FUNKCJE DO GENEROWANIA DANYCH (SYMULACJA BACKENDU) ---
const generateMockData = (hours: number, intervalMinutes: number) => {
  const points = [];
  const count = (hours * 60) / intervalMinutes;
  const now = new Date();

  // Generujemy dane wstecz od "teraz"
  for (let i = 0; i < count; i++) {
    const time = new Date(
      now.getTime() - (count - 1 - i) * intervalMinutes * 60000
    );
    const baseTemp = 21;
    const fluctuation = Math.sin(i / 10) * 1.5 + (Math.random() * 0.4 - 0.2);

    points.push({
      timestamp: time,
      value: parseFloat((baseTemp + fluctuation).toFixed(1)),
    });
  }
  return points;
};

const RAW_DATA_24H = generateMockData(24, 30);
const RAW_DATA_3D = generateMockData(72, 60);

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

// --- LOGIKA PRZYGOTOWANIA DANYCH DLA WYKRESU (FRONTEND) ---
const prepareDataForChart = (
  rawData: typeof RAW_DATA_24H,
  range: "1D" | "3D",
  spacing: number
) => {
  const labelWidth = 60;
  const labelShift = spacing / 2 - labelWidth / 2;

  return rawData.map((item, index) => {
    let showLabel = false;
    if (range === "1D") {
      if (index % 4 === 0) showLabel = true;
    } else if (range === "3D") {
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

export default function InsideTemperatureDetails() {
  const theme = useTheme();
  const [w, setW] = React.useState(0);
  const [selectedRange, setSelectedRange] = React.useState<"1D" | "3D">("1D");

  const vividGreen = "#16a34a";
  const spacing = selectedRange === "1D" ? 20 : 12;

  const currentRawData = selectedRange === "1D" ? RAW_DATA_24H : RAW_DATA_3D;
  const chartData = React.useMemo(
    () => prepareDataForChart(currentRawData, selectedRange, spacing),
    [currentRawData, selectedRange, spacing]
  );

  const nowValue = currentRawData[currentRawData.length - 1].value;
  const status =
    nowValue < TARGET_MIN
      ? "Poniżej"
      : nowValue > TARGET_MAX
      ? "Powyżej"
      : "W zakresie";

  const distToLower = Math.abs(nowValue - TARGET_MIN);
  const distToUpper = Math.abs(TARGET_MAX - nowValue);
  const closer = distToLower <= distToUpper ? "dolnej" : "górnej";
  const deltaVal =
    closer === "dolnej" ? nowValue - TARGET_MIN : TARGET_MAX - nowValue;
  const deltaStr = `${deltaVal >= 0 ? "+" : ""}${deltaVal.toFixed(
    1
  )} °C do ${closer}`;

  const refLineConfig = {
    color: vividGreen,
    thickness: 1,
    type: "dashed" as const,
    dashWidth: 10,
    dashGap: 8,
    labelText: "",
    labelTextStyle: {
      color: vividGreen,
      fontSize: 13,
      fontWeight: "700",
      marginBottom: 4,
    },
  };

  return (
    <View
      style={styles.wrap}
      onLayout={(e) => {
        const width = e.nativeEvent.layout.width;
        if (width > 0 && Math.abs(w - width) > 1) {
          setW(width);
        }
      }}
    >
      <View style={styles.headerRow}>
        <View>
          <Text variant="titleLarge">Temperatura wewnętrzna</Text>
          <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 4 }}>
            Pas docelowy {TARGET_MIN}–{TARGET_MAX}°C (poglądowo)
          </Text>
        </View>
      </View>

      <View style={styles.rangeContainer}>
        {(["1D", "3D"] as const).map((range) => {
          const isActive = selectedRange === range;
          return (
            <TouchableOpacity
              key={range}
              onPress={() => setSelectedRange(range)}
              style={[
                styles.rangeButton,
                isActive && { backgroundColor: theme.colors.primaryContainer },
              ]}
            >
              <Text
                style={[
                  styles.rangeText,
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
          style={{ marginTop: 12, position: "relative", overflow: "visible" }}
        >
          {(() => {
            // Obliczamy szerokość wykresu z uwzględnieniem bezpiecznego marginesu na ostatnią etykietę
            const chartWidth = w - SAFE_RIGHT_MARGIN;

            // Szerokość tła synchronizujemy z obszarem rysowania wykresu
            const chartDrawAreaWidth = chartWidth - Y_LABEL_W + BG_RIGHT_EXTEND;

            const pxPerDegree = CHART_H / FIXED_MAX;
            const topOffsetBase = (FIXED_MAX - TARGET_MAX) * pxPerDegree;
            const topOffset = topOffsetBase + BG_TOP_SHIFT;
            const bandHeightBase = (TARGET_MAX - TARGET_MIN) * pxPerDegree;
            const bandHeight = bandHeightBase + BG_HEIGHT_CORRECTION;

            return (
              <>
                {/* ZIELONE TŁO */}
                <View
                  style={{
                    position: "absolute",
                    left: Y_LABEL_W,
                    top: topOffset,
                    width: chartDrawAreaWidth,
                    height: bandHeight,
                    backgroundColor: "rgba(22, 163, 74, 0.12)",
                    zIndex: 0,
                  }}
                />

                <LineChart
                  key={`${w}-${selectedRange}`}
                  width={chartWidth}
                  height={CHART_H}
                  data={chartData}
                  spacing={spacing}
                  // LINIE REFERENCYJNE
                  showReferenceLine1
                  referenceLine1Position={TARGET_MAX}
                  referenceLine1Config={{
                    ...refLineConfig,
                    labelText: `Max ${TARGET_MAX}°C`,
                  }}
                  showReferenceLine2
                  referenceLine2Position={TARGET_MIN}
                  referenceLine2Config={{
                    ...refLineConfig,
                    labelText: `Min ${TARGET_MIN}°C`,
                  }}
                  curved
                  thickness={3}
                  hideRules={false}
                  yAxisLabelWidth={Y_LABEL_W}
                  initialSpacing={LEFT_PAD}
                  endSpacing={0}
                  yAxisColor={theme.colors.outlineVariant}
                  xAxisColor={theme.colors.outlineVariant}
                  yAxisTextStyle={{ opacity: 0.7 }}
                  xAxisLabelTextStyle={{ opacity: 0.7 }}
                  color={theme.colors.primary}
                  maxValue={FIXED_MAX}
                  yAxisLabelTexts={Y_LABELS}
                  noOfSections={Y_LABELS.length - 1}
                  scrollToEnd
                  scrollAnimation={false}
                  hideDataPoints={true}
                  // --- KONFIGURACJA TOOLTIPA ---
                  pointerConfig={{
                    pointerStripHeight: CHART_H,
                    pointerStripColor: theme.colors.outlineVariant,
                    pointerStripWidth: 2,
                    pointerColor: theme.colors.primary,
                    radius: 4,
                    // Dajemy dużo miejsca na dymek
                    pointerLabelWidth: 100,
                    pointerLabelHeight: 90,
                    // KLUCZOWE DLA PRZEWIJANIA: true (wymaga przytrzymania palca)
                    activatePointersOnLongPress: true,
                    // KLUCZOWE DLA WIDOCZNOŚCI: true (niech biblioteka sama ustawi pozycję, żeby nie ucięło)
                    autoAdjustPointerLabelPosition: true,

                    pointerLabelComponent: (items: any) => {
                      const item = items[0];
                      const { full } = formatDateTime(item.timestamp);
                      return (
                        <View
                          style={{
                            height: 90,
                            width: 100,
                            justifyContent: "center",
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
                              {item.value}°C
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
              </>
            );
          })()}
        </View>
      )}

      {/* INSTRUKCJA OBSŁUGI GESTÓW */}
      <View style={{ alignItems: "center", marginTop: 8 }}>
        <Text variant="labelSmall" style={{ opacity: 0.5 }}>
          Przytrzymaj wykres, aby sprawdzić punkt
        </Text>
      </View>

      <View style={styles.legend}>
        <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
        <Text style={{ marginRight: 16 }}>Wewnątrz</Text>

        <View style={styles.legendItem}>
          <View style={[styles.dashLine, { borderColor: vividGreen }]} />
          <Text style={styles.legendLabel}>
            Zakres {TARGET_MIN}–{TARGET_MAX} °C
          </Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>
            Wewnątrz (teraz)
          </Text>
          <Text variant="titleMedium">{nowValue.toFixed(1)} °C</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            Ostatni odczyt
          </Text>
        </View>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>
            Status
          </Text>
          <Text variant="titleMedium">{status}</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            vs pasmo {TARGET_MIN}–{TARGET_MAX} °C
          </Text>
        </View>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>
            Δ do granicy
          </Text>
          <Text variant="titleMedium">{deltaStr}</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            bliższa
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {},
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  rangeContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
    gap: 8,
  },
  rangeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
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

  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dashLine: {
    width: 24,
    height: 0,
    borderTopWidth: 2,
    borderStyle: "dashed",
  },
  legendLabel: {},
  row: { flexDirection: "row", gap: 12, marginTop: 12 },
  col: { flex: 1 },
});
