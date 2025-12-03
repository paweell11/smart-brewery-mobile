import * as React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
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
const SAFE_RIGHT_MARGIN = 0;

// Stała do korekty szerokości ScrollView (rozszerzenie paska przewijania do krawędzi)
const CONTAINER_PAD = 100;

// Definicja typów zakresów
type RangeType = "1D" | "3D" | "7D" | "2T" | "4T";

// --- POMOCNICZE FUNKCJE DO GENEROWANIA DANYCH (SYMULACJA BACKENDU) ---
const generateMockData = (hours: number, intervalMinutes: number) => {
  const points = [];
  const count = Math.floor((hours * 60) / intervalMinutes);
  const now = new Date();

  // Generujemy dane wstecz od "teraz"
  for (let i = 0; i < count; i++) {
    const time = new Date(
      now.getTime() - (count - 1 - i) * intervalMinutes * 60000
    );
    const baseTemp = 21;
    // Symulacja wolnych zmian temperatury (fermentacja) + dobowe wahania
    const fluctuation =
      Math.sin(i / 20) * 1.0 + // Dłuższy trend
      Math.sin(i / 5) * 0.3 + // Krótkie wahania
      (Math.random() * 0.2 - 0.1);

    points.push({
      timestamp: time,
      value: parseFloat((baseTemp + fluctuation).toFixed(1)),
    });
  }
  return points;
};

// Generujemy dane dla różnych zakresów
// Im dłuższy zakres, tym rzadszy interwał próbkowania, aby nie generować tysięcy punktów
const RAW_DATA_1D = generateMockData(24, 30); // Co 30 min
const RAW_DATA_3D = generateMockData(72, 60); // Co 1h
const RAW_DATA_7D = generateMockData(168, 120); // 7 dni, co 2h
const RAW_DATA_2T = generateMockData(336, 240); // 14 dni (2 tyg), co 4h
const RAW_DATA_4T = generateMockData(672, 360); // 28 dni (4 tyg), co 6h

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
  rawData: { timestamp: Date; value: number }[],
  range: RangeType,
  spacing: number
) => {
  const labelWidth = 60;
  const labelShift = spacing / 2 - labelWidth / 2;

  return rawData.map((item, index) => {
    let showLabel = false;

    // Logika zagęszczenia etykiet na osi X w zależności od zakresu.
    // CEL: Utrzymać podobną odległość wizualną (piksele) między etykietami.
    // 1D: spacing 20 * 4 = 80px
    // Reszta: spacing 12 * 6 = 72px (bardzo zbliżone)
    switch (range) {
      case "1D":
        // Co 4. punkt
        if (index % 4 === 0) showLabel = true;
        break;
      case "3D":
        // Co 6. punkt
        if (index % 6 === 0) showLabel = true;
        break;
      case "7D":
        // Zmieniono z 12 na 6, aby zagęścić etykiety
        if (index % 6 === 0) showLabel = true;
        break;
      case "2T":
        // Zmieniono z 12 na 6, aby zagęścić etykiety
        if (index % 6 === 0) showLabel = true;
        break;
      case "4T":
        // Zmieniono z 16 na 6, aby zagęścić etykiety
        if (index % 6 === 0) showLabel = true;
        break;
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
  const [selectedRange, setSelectedRange] = React.useState<RangeType>("1D");

  const vividGreen = "#16a34a";
  // Dla 1D dajemy szerzej (20), dla reszty ciaśniej (12), żeby zmieścić więcej historii
  const spacing = selectedRange === "1D" ? 20 : 12;

  // Wybór odpowiedniego zestawu danych
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
          <Text variant="titleLarge">Temperatura wewnętrzna</Text>
          <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 4 }}>
            Pas docelowy {TARGET_MIN}–{TARGET_MAX}°C (poglądowo)
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
            const chartDrawAreaWidth = chartWidth - Y_LABEL_W + BG_RIGHT_EXTEND;

            const pxPerDegree = CHART_H / FIXED_MAX;
            const topOffsetBase = (FIXED_MAX - TARGET_MAX) * pxPerDegree;
            const topOffset = topOffsetBase + BG_TOP_SHIFT;
            const bandHeightBase = (TARGET_MAX - TARGET_MIN) * pxPerDegree;
            const bandHeight = bandHeightBase + BG_HEIGHT_CORRECTION;

            const dashedLineStyle = {
              position: "absolute" as const,
              left: Y_LABEL_W,
              width: chartDrawAreaWidth,
              borderTopWidth: 1,
              borderColor: vividGreen,
              borderStyle: "dashed" as const,
              zIndex: 0,
              elevation: 0,
            };

            const labelTextStyle = {
              position: "absolute" as const,
              left: Y_LABEL_W,
              color: vividGreen,
              fontWeight: "bold" as const,
              fontSize: 13,
              zIndex: 0,
              elevation: 0,
            };

            return (
              <>
                <View
                  style={{
                    position: "absolute",
                    left: Y_LABEL_W,
                    top: topOffset,
                    width: chartDrawAreaWidth,
                    height: bandHeight,
                    backgroundColor: "rgba(22, 163, 74, 0.12)",
                    zIndex: 0,
                    elevation: 0,
                  }}
                />

                <View style={[dashedLineStyle, { top: topOffset }]} />
                <Text style={[labelTextStyle, { top: topOffset - 20 }]}>
                  Max {TARGET_MAX}°C
                </Text>

                <View
                  style={[dashedLineStyle, { top: topOffset + bandHeight }]}
                />
                <Text
                  style={[labelTextStyle, { top: topOffset + bandHeight - 20 }]}
                >
                  Min {TARGET_MIN}°C
                </Text>

                <View style={{ zIndex: 10, elevation: 10 }}>
                  <LineChart
                    key={`${w}-${selectedRange}`}
                    width={chartWidth}
                    height={CHART_H}
                    data={chartData}
                    spacing={spacing}
                    showReferenceLine1={false}
                    showReferenceLine2={false}
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
                    maxValue={FIXED_MAX}
                    yAxisLabelTexts={Y_LABELS}
                    noOfSections={Y_LABELS.length - 1}
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
                </View>
              </>
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
    </ScrollView>
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
    // Dodano wrapowanie, aby przyciski zmieściły się na małych ekranach
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

  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  dashLine: {
    width: 24,
    height: 0,
    borderTopWidth: 2,
    borderStyle: "dashed",
  },
  legendLabel: {},
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
