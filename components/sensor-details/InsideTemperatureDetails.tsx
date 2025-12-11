import { useSensorData } from "@/hooks/useSensorData";
import * as React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Text, useTheme } from "react-native-paper";
import { TempDataType } from "./types";

// --- KONFIGURACJA WYKRESU ---
const Y_LABEL_W = 40;
const LEFT_PAD = 10;
const FIXED_MAX = 35;
const CHART_H = 220;
const Y_LABELS = ["0", "5", "10", "15", "20", "25", "30", "35"].map(
  (v) => `${v}°`
);

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
const TARGET_POINTS_COUNT = 40;

// Definicja typów zakresów
type RangeType = "1D" | "3D" | "7D" | "2T" | "4T";

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

// --- LOGIKA PRZYGOTOWANIA DANYCH DLA WYKRESU ---
const prepareDataForChart = (
  rawData: { timestamp: Date; value: number }[],
  range: RangeType,
  spacing: number
) => {
  const labelWidth = 60;
  const labelShift = spacing / 2 - labelWidth / 2;

  // Ustalamy sztywny krok etykiet w zależności od zagęszczenia punktów (spacing).
  const step = range === "1D" ? 4 : 6;

  return rawData.map((item, index) => {
    // Liczymy indeks od końca, aby etykiety były "zakotwiczone" z prawej strony (od "Teraz").
    const indexFromEnd = rawData.length - 1 - index;

    let showLabel = false;

    // Jeśli indeks od końca dzieli się przez krok bez reszty, pokazujemy etykietę.
    if (indexFromEnd % step === 0) {
      showLabel = true;
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

  // 1. POBIERANIE DANYCH
  const { data, isPending } = useSensorData<TempDataType[]>({
    sensorPath: "/readings/temperature",
    searchParams: [
      { days: "1" },
      { days: "3" },
      { days: "7" },
      { days: "14" },
      { days: "28" },
    ],
  });

  // --- LOGOWANIE DANYCH DO KONSOLI ---
  React.useEffect(() => {
    if (data) {
      console.log("=== POBRANE TEMP WEWNĄTRZ ===");
      data.forEach((d, i) => {
        console.log(`Zestaw ${i}: ${d ? d.length : 0} punktów`);
      });
    }
  }, [data]);

  const [w, setW] = React.useState(0);
  const [selectedRange, setSelectedRange] = React.useState<RangeType>("1D");

  const vividGreen = "#16a34a";
  const spacing = selectedRange === "1D" ? 20 : 12;

  // Wybór surowych danych
  let rawBackendData: TempDataType[] | null = null;
  if (data && data.length >= 5) {
    switch (selectedRange) {
      case "1D":
        rawBackendData = data[0];
        break;
      case "3D":
        rawBackendData = data[1];
        break;
      case "7D":
        rawBackendData = data[2];
        break;
      case "2T":
        rawBackendData = data[3];
        break;
      case "4T":
        rawBackendData = data[4];
        break;
      default:
        rawBackendData = data[0];
    }
  }

  const { processedChartData, stats } = React.useMemo(() => {
    if (!rawBackendData || rawBackendData.length === 0) {
      return { processedChartData: [], stats: { now: 0 } };
    }

    // Sortowanie chronologiczne
    const fullSortedHistory = [...rawBackendData].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const lastItem = fullSortedHistory[fullSortedHistory.length - 1];
    const nowValue = lastItem.temperature_celsius;
    const nowTimestamp = new Date(lastItem.timestamp).getTime();

    // Downsampling
    const totalPoints = fullSortedHistory.length;
    let sampledData = [];

    if (totalPoints <= TARGET_POINTS_COUNT) {
      sampledData = fullSortedHistory.map((item) => ({
        value: item.temperature_celsius,
        timestamp: new Date(item.timestamp),
      }));
    } else {
      const step = Math.ceil(totalPoints / TARGET_POINTS_COUNT);
      for (let i = 0; i < totalPoints; i += step) {
        const item = fullSortedHistory[i];
        sampledData.push({
          value: item.temperature_celsius,
          timestamp: new Date(item.timestamp),
        });
      }

      const lastSampled = sampledData[sampledData.length - 1];
      if (lastSampled.timestamp.getTime() !== nowTimestamp) {
        sampledData.push({
          value: nowValue,
          timestamp: new Date(nowTimestamp),
        });
      }
    }

    return {
      processedChartData: sampledData,
      stats: { now: nowValue },
    };
  }, [rawBackendData]);

  const chartData = React.useMemo(
    () => prepareDataForChart(processedChartData, selectedRange, spacing),
    [processedChartData, selectedRange, spacing]
  );

  const hasData = processedChartData.length > 0;

  // Obliczanie statusów
  const nowValue = stats.now;
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

  if (isPending) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          minHeight: 300,
          marginHorizontal: -CONTAINER_PAD,
          paddingLeft: CONTAINER_PAD,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 10, opacity: 0.6 }}>
          Pobieranie danych...
        </Text>
      </View>
    );
  }

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

      {!hasData ? (
        <View
          style={{
            height: CHART_H,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text>Brak danych dla wybranego okresu.</Text>
        </View>
      ) : (
        w > 0 && (
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
              const chartDrawAreaWidth =
                chartWidth - Y_LABEL_W + BG_RIGHT_EXTEND;

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
                    style={[
                      labelTextStyle,
                      { top: topOffset + bandHeight - 20 },
                    ]}
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
                      endSpacing={6}
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
        )
      )}

      <View style={{ alignItems: "center", marginTop: 8 }}>
        <Text variant="labelSmall" style={{ opacity: 0.5 }}>
          {hasData ? "Przytrzymaj wykres, aby sprawdzić punkt" : ""}
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
          <Text variant="titleMedium">
            {hasData ? nowValue.toFixed(1) : "--"} °C
          </Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            Ostatni odczyt
          </Text>
        </View>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>
            Status
          </Text>
          <Text variant="titleMedium">{hasData ? status : "--"}</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            vs pasmo {TARGET_MIN}–{TARGET_MAX} °C
          </Text>
        </View>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>
            Δ do granicy
          </Text>
          <Text variant="titleMedium">{hasData ? deltaStr : "--"}</Text>
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
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 4,
  },
  rangeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 0,
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
