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
import { WeightDataType } from "./types";

// --- KONFIGURACJA WYKRESU ---
const Y_LABEL_W = 40;
const LEFT_PAD = 10;
const CHART_H = 220;
// Stała do korekty szerokości ScrollView
const CONTAINER_PAD = 100;
const SAFE_RIGHT_MARGIN = 0;

// Docelowa liczba punktów na wykresie.
const TARGET_POINTS_COUNT = 40;

// Konfiguracja skali Wagi (0 do 300)
const WEIGHT_MIN_Y = 0;
// Zakres wartości (300 - 0 = 300)
const WEIGHT_RANGE = 300;
// Etykiety co 25 (0, 25, 50... 300)
// 300 / 25 = 12 sekcji
const Y_LABELS = [
  "0",
  "25",
  "50",
  "75",
  "100",
  "125",
  "150",
  "175",
  "200",
  "225",
  "250",
  "275",
  "300",
];

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

// --- LOGIKA PRZYGOTOWANIA DANYCH ---
const prepareDataForChart = (
  rawData: { timestamp: Date; value: number }[],
  range: RangeType,
  spacing: number
) => {
  const labelWidth = 60;
  const labelShift = spacing / 2 - labelWidth / 2;

  // Ustalamy sztywny krok etykiet w zależności od zagęszczenia punktów (spacing).
  // Dla 1D (spacing 20) -> co 4 punkty (4 * 20 = 80px odstępu)
  // Dla reszty (spacing 12) -> co 6 punktów (6 * 12 = 72px odstępu)
  // Zapewnia to wizualną spójność i czytelność.
  const step = range === "1D" ? 4 : 6;

  return rawData.map((item, index) => {
    // Liczymy indeks od końca, aby etykiety były "zakotwiczone" z prawej strony (od "Teraz").
    // Dzięki temu ostatnia etykieta i poprzednie mają zawsze równy odstęp.
    const indexFromEnd = rawData.length - 1 - index;

    let showLabel = false;

    // Prosta arytmetyka: jeśli indeks od końca dzieli się przez krok bez reszty, pokazujemy etykietę.
    // indexFromEnd = 0 (ostatni element) -> 0 % step === 0 -> PRAWDA
    // indexFromEnd = step -> step % step === 0 -> PRAWDA
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

export default function WeightDetails() {
  const { data, isSuccess, isPending, isError } = useSensorData<
    WeightDataType[]
  >({
    sensorPath: "/readings/weight",
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
      console.log("=== POBRANE DANE Z BACKENDU (WeightDetails) ===");
      data.forEach((d, i) => {
        console.log(`Zestaw ${i}: ${d ? d.length : 0} punktów`);
      });
    }
  }, [data]);

  const theme = useTheme();
  const [w, setW] = React.useState(0);
  const [selectedRange, setSelectedRange] = React.useState<RangeType>("1D");

  const spacing = selectedRange === "1D" ? 20 : 12;

  // 1. Wybór odpowiedniego zestawu danych z backendu
  let rawBackendData: WeightDataType[] | null = null;

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

  // 2. PRZETWARZANIE DANYCH (Memoizacja)
  const { processedChartData, stats } = React.useMemo(() => {
    if (!rawBackendData || rawBackendData.length === 0) {
      return { processedChartData: [], stats: { now: 0, change24h: null } };
    }

    // --- KROK A: Sortowanie pełnego zestawu danych (Chronologicznie) ---
    const fullSortedHistory = [...rawBackendData].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const lastItem = fullSortedHistory[fullSortedHistory.length - 1];
    const nowValue = lastItem.weight_kg;
    const nowTimestamp = new Date(lastItem.timestamp).getTime();

    // --- KROK B: Obliczanie Zmiany (Trendu) ZAWSZE DLA 24H ---
    // Niezależnie od wybranego zakresu, zawsze szukamy zmiany w ciągu ostatnich 24h.
    const oneDayMs = 24 * 60 * 60 * 1000;
    const targetTime = nowTimestamp - oneDayMs;
    let change24h: number | null = null;

    const oldestTimestamp = new Date(fullSortedHistory[0].timestamp).getTime();

    // Sprawdzenie czy mamy wystarczająco stare dane (margines 1h)
    if (oldestTimestamp > targetTime + 60 * 60 * 1000) {
      change24h = null; // Historia jest krótsza niż 24h (minus margines)
    } else {
      let closestDist = Infinity;
      let closestVal = null;

      for (const item of fullSortedHistory) {
        const t = new Date(item.timestamp).getTime();
        const dist = Math.abs(t - targetTime);
        if (dist < closestDist) {
          closestDist = dist;
          closestVal = item.weight_kg;
        }
      }

      // Akceptujemy punkt, jeśli jest w miarę blisko celu (np. max 4h odchyłki)
      if (closestVal !== null && closestDist < 4 * 60 * 60 * 1000) {
        change24h = nowValue - closestVal;
      } else {
        change24h = null;
      }
    }

    // --- KROK C: Agresywne Próbkowanie (Downsampling) dla WYKRESU ---
    const totalPoints = fullSortedHistory.length;
    let sampledData = [];

    if (totalPoints <= TARGET_POINTS_COUNT) {
      sampledData = fullSortedHistory.map((item) => ({
        value: item.weight_kg,
        timestamp: new Date(item.timestamp),
      }));
    } else {
      const step = Math.ceil(totalPoints / TARGET_POINTS_COUNT);
      for (let i = 0; i < totalPoints; i += step) {
        const item = fullSortedHistory[i];
        sampledData.push({
          value: item.weight_kg,
          timestamp: new Date(item.timestamp),
        });
      }

      // Zawsze upewnij się, że OSTATNI punkt (Teraz) jest na wykresie
      const lastSampled = sampledData[sampledData.length - 1];
      if (lastSampled.timestamp.getTime() !== nowTimestamp) {
        sampledData.push({
          value: lastItem.weight_kg,
          timestamp: new Date(lastItem.timestamp),
        });
      }
    }

    return {
      processedChartData: sampledData,
      stats: { now: nowValue, change24h: change24h },
    };
  }, [rawBackendData]);

  const chartData = React.useMemo(
    () => prepareDataForChart(processedChartData, selectedRange, spacing),
    [processedChartData, selectedRange, spacing]
  );

  const hasData = processedChartData.length > 0;

  // Formatowanie tekstu trendu
  let changeStr = "Brak danych\nodniesienia";

  if (hasData) {
    if (stats.change24h !== null) {
      const val = stats.change24h;
      changeStr = `${val >= 0 ? "+" : ""}${val.toFixed(2)} kg`;
    }
  }

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

              return (
                <View
                  style={{ zIndex: 10, elevation: 10, overflow: "visible" }}
                >
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
                    // Zmiana endSpacing na 6 zgodnie z życzeniem
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
                    // --- KONFIGURACJA ZAKRESU 0-300 ---
                    yAxisOffset={WEIGHT_MIN_Y} // Start od 0
                    maxValue={WEIGHT_RANGE} // Zakres 300
                    yAxisLabelTexts={Y_LABELS} // Sztywne etykiety
                    noOfSections={12} // Co 25 (300 / 25 = 12)
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
        )
      )}

      <View style={{ alignItems: "center", marginTop: 8 }}>
        <Text variant="labelSmall" style={{ opacity: 0.5 }}>
          {hasData ? "Przytrzymaj wykres, aby sprawdzić punkt" : ""}
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
          <Text variant="titleMedium">
            {hasData ? stats.now.toFixed(2) : "--"} kg
          </Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            Ostatni odczyt
          </Text>
        </View>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>
            Zmiana (24h)
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
