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
import { SegmentedButtons, Text, useTheme } from "react-native-paper";
import { TempDataType } from "./types";

// --- KONFIGURACJA WYKRESU (Bliźniacza do index.tsx) ---
const Y_LABEL_W = 40;
const LEFT_PAD = 10;
const RIGHT_PAD = Y_LABEL_W + LEFT_PAD;
// Stała do korekty szerokości ScrollView
const CONTAINER_PAD = 100;
const SAFE_RIGHT_MARGIN = 0;
const BG_RIGHT_EXTEND = 40; // Używane do obliczenia szerokości obszaru rysowania
const CHART_H = 220;
const TARGET_POINTS_COUNT = 40;

// DEFINICJA ETYKIET OSI Y
// Tryb Dual: 0-35 co 5 stopni
const DUAL_Y_LABELS = ["0", "5", "10", "15", "20", "25", "30", "35"].map(
  (v) => `${v}°`
);
// Tryb Delta: -4 do 12 co 2 stopnie
const DELTA_Y_LABELS = ["-4", "-2", "0", "2", "4", "6", "8", "10", "12"].map(
  (v) => `${v}°`
);

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

// --- LOGIKA PRZYGOTOWANIA DANYCH (LABELE) ---
const prepareDataForChart = (
  mergedData: { timestamp: Date; inside: number; outside: number }[],
  range: RangeType,
  spacing: number,
  mode: "dual" | "delta"
) => {
  const labelWidth = 60;
  const labelShift = spacing / 2 - labelWidth / 2;
  const step = range === "1D" ? 4 : 6;

  // Mapowanie danych w zależności od trybu
  return mergedData.map((item, index) => {
    // Liczymy indeks od końca
    const indexFromEnd = mergedData.length - 1 - index;
    let showLabel = false;

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

    if (mode === "dual") {
      return {
        value: item.inside, // Primary line (Inside)
        value2: item.outside, // Secondary line (Outside)
        timestamp: item.timestamp,
        labelComponent: labelComponent,
      };
    } else {
      // Delta mode
      const diff = parseFloat((item.inside - item.outside).toFixed(1));
      return {
        value: diff,
        timestamp: item.timestamp,
        labelComponent: labelComponent,
      };
    }
  });
};

export default function TemperatureDetails() {
  const theme = useTheme();

  // 1. POBIERANIE DANYCH
  // Wewnątrz
  const insideQuery = useSensorData<TempDataType[]>({
    sensorPath: "/readings/temperature",
    searchParams: [
      { days: "1" },
      { days: "3" },
      { days: "7" },
      { days: "14" },
      { days: "28" },
    ],
  });

  // Zewnątrz
  // Zakładamy, że typ danych jest taki sam (ma pole timestamp i temperature_celsius)
  const outsideQuery = useSensorData<TempDataType[]>({
    sensorPath: "/readings/outsideTemp",
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
    if (insideQuery.data) {
      console.log("=== POBRANE TEMP WEWNĄTRZ ===");
      insideQuery.data.forEach((d, i) =>
        console.log(`In Set ${i}: ${d ? d.length : 0} punktów`)
      );
    }
  }, [insideQuery.data]);

  React.useEffect(() => {
    if (outsideQuery.data) {
      console.log("=== POBRANE TEMP ZEWNĄTRZ ===");
      outsideQuery.data.forEach((d, i) =>
        console.log(`Out Set ${i}: ${d ? d.length : 0} punktów`)
      );
    }
  }, [outsideQuery.data]);

  const [w, setW] = React.useState(0);
  const [mode, setMode] = React.useState<"dual" | "delta">("dual");
  const [selectedRange, setSelectedRange] = React.useState<RangeType>("1D");

  // Kolory
  const colorInside = theme.colors.primary;
  const colorOutside = theme.colors.tertiary; // Kolor dla "Otoczenie"
  const colorDelta = theme.colors.secondary;

  const spacing = selectedRange === "1D" ? 20 : 12;

  // 2. WYBÓR SUROWYCH DANYCH
  let rawIn: TempDataType[] = [];
  let rawOut: TempDataType[] = [];

  const inData = insideQuery.data;
  const outData = outsideQuery.data;

  // Funkcja pomocnicza do pobierania indeksu z tablicy danych
  const getIndexForRange = (r: RangeType) => {
    switch (r) {
      case "1D":
        return 0;
      case "3D":
        return 1;
      case "7D":
        return 2;
      case "2T":
        return 3;
      case "4T":
        return 4;
      default:
        return 0;
    }
  };

  const idx = getIndexForRange(selectedRange);

  if (inData && inData[idx]) {
    rawIn = inData[idx]!;
  }
  if (outData && outData[idx]) {
    rawOut = outData[idx]!;
  }

  // 3. MERGING & DOWNSAMPLING
  const { processedChartData, stats } = React.useMemo(() => {
    // Potrzebujemy przynajmniej danych wewnętrznych
    if (rawIn.length === 0) {
      return {
        processedChartData: [],
        stats: { nowInside: 0, nowOutside: 0 },
      };
    }

    // Sortowanie
    const sortedIn = [...rawIn].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const sortedOut = [...rawOut].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Statystyki "Teraz" (ostatnie dostępne punkty, niezależnie od synchronizacji)
    const lastIn = sortedIn[sortedIn.length - 1];
    const lastOut =
      sortedOut.length > 0 ? sortedOut[sortedOut.length - 1] : null;

    const nowInsideVal = lastIn.temperature_celsius;
    const nowOutsideVal = lastOut ? lastOut.temperature_celsius : 0;

    // Synchronizacja: Dla każdego punktu IN znajdź najbliższy OUT
    // Tworzymy połączoną listę
    const mergedList: { timestamp: Date; inside: number; outside: number }[] =
      [];

    // Lepsza implementacja MERGE (liniowa O(N+M)):
    let pOut = 0;
    for (let i = 0; i < sortedIn.length; i++) {
      const inItem = sortedIn[i];
      const inTime = new Date(inItem.timestamp).getTime();

      let bestOutVal =
        sortedOut.length > 0 ? sortedOut[0].temperature_celsius : 0;

      if (sortedOut.length > 0) {
        // Przesuwaj pOut dopóki następny element nie jest bliżej niż obecny
        while (pOut < sortedOut.length - 1) {
          const curr = sortedOut[pOut];
          const next = sortedOut[pOut + 1];
          const currDist = Math.abs(
            new Date(curr.timestamp).getTime() - inTime
          );
          const nextDist = Math.abs(
            new Date(next.timestamp).getTime() - inTime
          );

          if (nextDist <= currDist) {
            pOut++;
          } else {
            break;
          }
        }
        bestOutVal = sortedOut[pOut].temperature_celsius;
      }

      mergedList.push({
        timestamp: new Date(inItem.timestamp),
        inside: inItem.temperature_celsius,
        outside: bestOutVal,
      });
    }

    // Downsampling do TARGET_POINTS_COUNT
    const totalPoints = mergedList.length;
    let sampledData = [];

    if (totalPoints <= TARGET_POINTS_COUNT) {
      sampledData = mergedList;
    } else {
      const step = Math.ceil(totalPoints / TARGET_POINTS_COUNT);
      for (let i = 0; i < totalPoints; i += step) {
        sampledData.push(mergedList[i]);
      }
      // Zawsze dodaj ostatni punkt (Teraz)
      const lastMerged = mergedList[mergedList.length - 1];
      const lastSampled = sampledData[sampledData.length - 1];
      if (lastSampled.timestamp.getTime() !== lastMerged.timestamp.getTime()) {
        sampledData.push(lastMerged);
      }
    }

    return {
      processedChartData: sampledData,
      stats: { nowInside: nowInsideVal, nowOutside: nowOutsideVal },
    };
  }, [rawIn, rawOut]);

  // Generowanie danych dla wykresu (Label Component itp.)
  const chartData = React.useMemo(
    () => prepareDataForChart(processedChartData, selectedRange, spacing, mode),
    [processedChartData, selectedRange, spacing, mode]
  );

  const hasData = processedChartData.length > 0;

  // Statystyki "Teraz"
  const nowInside = stats.nowInside;
  const nowOutside = stats.nowOutside;
  const diff = nowInside - nowOutside;
  const diffStr = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}°C`;

  // Konfiguracja Osi Y w zależności od trybu
  const isDual = mode === "dual";

  // Obliczenia dla skal:
  // Dual: 0-35 (Start 0, Range 35)
  // Delta: -4 do 12 (Start -4, Range 16)
  const yAxisOffset = isDual ? 0 : -4;
  const rangeVal = isDual ? 35 : 16;
  const yLabels = isDual ? DUAL_Y_LABELS : DELTA_Y_LABELS;
  const sections = isDual ? 7 : 8; // Dual: co 5 (7 sekcji = 35), Delta: co 2 (16/2=8 sekcji)

  const isPending = insideQuery.isPending || outsideQuery.isPending;

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
          <Text variant="titleLarge">Temperatura fermentacji</Text>
          <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 4 }}>
            {mode === "dual"
              ? "Wewnątrz vs otoczenie"
              : "Różnica temperatur (ΔT)"}
          </Text>
        </View>
      </View>

      {/* Przełącznik trybu */}
      <SegmentedButtons
        value={mode}
        onValueChange={(v) => setMode(v as "dual" | "delta")}
        style={{ marginTop: 10, marginBottom: 10 }}
        buttons={[
          { value: "dual", label: "Dwie serie" },
          { value: "delta", label: "Różnica" },
        ]}
      />

      {/* Przyciski zakresu (identyczne jak w index.tsx) */}
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
              // Obliczenia szerokości identyczne jak w index.tsx
              const chartWidth = w - 2 * CONTAINER_PAD - SAFE_RIGHT_MARGIN;

              // Konfiguracja Tooltipa (Pointer)
              const pointerConfig = {
                pointerStripHeight: CHART_H,
                pointerStripColor: theme.colors.outlineVariant,
                pointerStripWidth: 2,
                pointerColor: theme.colors.primary,
                radius: 4,
                pointerLabelWidth: 100,
                pointerLabelHeight: 60,
                activatePointersOnLongPress: true,
                autoAdjustPointerLabelPosition: false,
                shiftPointerLabelY: 45, // Blisko wykresu

                pointerLabelComponent: (items: any) => {
                  const item = items[0]; // W gifted charts items to tablica punktów w danym indeksie
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
                          alignItems: "center",
                        }}
                      >
                        {/* Wyświetlanie wartości w zależności od trybu */}
                        {/* Ujednolicony kolor tekstu: inverseOnSurface (biały/jasny) dla czytelności */}
                        {mode === "dual" ? (
                          <>
                            <Text
                              style={{
                                color: theme.colors.inverseOnSurface,
                                fontWeight: "bold",
                                fontSize: 12,
                              }}
                            >
                              Wew: {item.value}°C
                            </Text>
                            {/* items[0].value2 to druga seria (Outside) jeśli istnieje w data point */}
                            {item.value2 !== undefined && (
                              <Text
                                style={{
                                  color: theme.colors.inverseOnSurface,
                                  fontWeight: "bold",
                                  fontSize: 12,
                                }}
                              >
                                Zew: {item.value2}°C
                              </Text>
                            )}
                          </>
                        ) : (
                          <Text
                            style={{
                              color: theme.colors.inverseOnSurface,
                              fontWeight: "bold",
                              fontSize: 14,
                            }}
                          >
                            Δ: {item.value}°C
                          </Text>
                        )}

                        <Text
                          style={{
                            color: theme.colors.inverseOnSurface,
                            fontSize: 9,
                            opacity: 0.8,
                          }}
                        >
                          {full}
                        </Text>
                      </View>
                    </View>
                  );
                },
              };

              return (
                <View style={{ zIndex: 10, elevation: 10 }}>
                  <LineChart
                    key={`${w}-${selectedRange}-${mode}`}
                    width={chartWidth}
                    height={CHART_H}
                    // Przekazujemy dane
                    data={chartData} // Zawiera value (Inside) i labelComponent
                    data2={
                      mode === "dual"
                        ? chartData.map((d) => ({ value: d.value2 }))
                        : undefined
                    } // Tylko w trybie dual
                    spacing={spacing}
                    initialSpacing={LEFT_PAD}
                    endSpacing={6} // Zmiana na 6
                    // Style linii
                    curved
                    thickness={3}
                    thickness2={3} // Druga linia
                    color1={mode === "dual" ? colorInside : colorDelta}
                    color2={colorOutside}
                    // Osie
                    yAxisLabelWidth={Y_LABEL_W}
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
                    // --- KONFIGURACJA ZAKRESÓW ---
                    yAxisOffset={yAxisOffset}
                    maxValue={rangeVal}
                    yAxisLabelTexts={yLabels}
                    noOfSections={sections}
                    // -----------------------------

                    scrollToEnd
                    scrollAnimation={false}
                    hideDataPoints={true}
                    hideRules={false}
                    pointerConfig={pointerConfig}
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

      {/* Legenda */}
      {mode === "dual" ? (
        <View style={styles.legend}>
          <View style={[styles.dot, { backgroundColor: colorInside }]} />
          <Text style={{ marginRight: 16 }}>Wewnątrz</Text>
          <View style={[styles.dot, { backgroundColor: colorOutside }]} />
          <Text>Otoczenie</Text>
        </View>
      ) : (
        <View style={styles.legend}>
          <View style={[styles.dot, { backgroundColor: colorDelta }]} />
          <Text>ΔT (wewnątrz – otoczenie)</Text>
        </View>
      )}

      {/* Statystyki pod wykresem (Responsywne) */}
      <View style={styles.row}>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>
            Wewnątrz (teraz)
          </Text>
          <Text variant="titleMedium">
            {hasData ? nowInside.toFixed(1) : "--"}°C
          </Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            Ostatni odczyt
          </Text>
        </View>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>
            Na zewnątrz (teraz)
          </Text>
          <Text variant="titleMedium">
            {hasData ? nowOutside.toFixed(1) : "--"}°C
          </Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            Otoczenie
          </Text>
        </View>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>
            Różnica
          </Text>
          <Text variant="titleMedium">{hasData ? diffStr : "--"}</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            In–Out
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

  // Responsywny grid
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  col: {
    flexGrow: 1,
    minWidth: 100, // Zapobiega ściskaniu tekstu na małych ekranach
  },
});
