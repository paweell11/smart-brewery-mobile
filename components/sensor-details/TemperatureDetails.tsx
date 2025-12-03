import * as React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { SegmentedButtons, Text, useTheme } from "react-native-paper";

// --- KONFIGURACJA WYKRESU (Bliźniacza do index.tsx) ---
const Y_LABEL_W = 40;
const LEFT_PAD = 10;
const RIGHT_PAD = Y_LABEL_W + LEFT_PAD;
// Stała do korekty szerokości ScrollView
const CONTAINER_PAD = 100;
const SAFE_RIGHT_MARGIN = 0;
const BG_RIGHT_EXTEND = 40; // Używane do obliczenia szerokości obszaru rysowania
const CHART_H = 220;

// DEFINICJA ETYKIET OSI Y
// Tryb Dual: 0-30 co 5 stopni
const DUAL_Y_LABELS = ["0", "5", "10", "15", "20", "25", "30"].map(
  (v) => `${v}°`
);
// Tryb Delta: 0-10 co 2 stopnie
const DELTA_Y_LABELS = ["0", "2", "4", "6", "8", "10"].map((v) => `${v}°`);

// Definicja typów zakresów
type RangeType = "1D" | "3D" | "7D" | "2T" | "4T";

// --- POMOCNICZE FUNKCJE DO GENEROWANIA DANYCH ---
const generateDualMockData = (hours: number, intervalMinutes: number) => {
  const points = [];
  const count = Math.floor((hours * 60) / intervalMinutes);
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const time = new Date(
      now.getTime() - (count - 1 - i) * intervalMinutes * 60000
    );

    // Symulacja temperatury wewnętrznej (stabilniejsza)
    const insideBase = 21;
    const insideFluct = Math.sin(i / 25) * 0.8 + Math.random() * 0.1;

    // Symulacja temperatury zewnętrznej (większa amplituda, chłodniej)
    const outsideBase = 15;
    const outsideFluct = Math.sin(i / 10) * 3.0 + Math.random() * 0.3;

    points.push({
      timestamp: time,
      inside: parseFloat((insideBase + insideFluct).toFixed(1)),
      outside: parseFloat((outsideBase + outsideFluct).toFixed(1)),
    });
  }
  return points;
};

// Generowanie danych dla zakresów
const RAW_DATA_1D = generateDualMockData(24, 30);
const RAW_DATA_3D = generateDualMockData(72, 60);
const RAW_DATA_7D = generateDualMockData(168, 120);
const RAW_DATA_2T = generateDualMockData(336, 240);
const RAW_DATA_4T = generateDualMockData(672, 360);

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
  rawData: { timestamp: Date; inside: number; outside: number }[],
  range: RangeType,
  spacing: number,
  mode: "dual" | "delta"
) => {
  const labelWidth = 60;
  const labelShift = spacing / 2 - labelWidth / 2;

  // Mapowanie danych w zależności od trybu
  return rawData.map((item, index) => {
    let showLabel = false;
    // Logika gęstości etykiet (identyczna jak w index.tsx)
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
  const [w, setW] = React.useState(0);
  const [mode, setMode] = React.useState<"dual" | "delta">("dual");
  const [selectedRange, setSelectedRange] = React.useState<RangeType>("1D");

  // Kolory
  const colorInside = theme.colors.primary;
  const colorOutside = theme.colors.tertiary; // Kolor dla "Otoczenie"
  const colorDelta = theme.colors.secondary;

  const spacing = selectedRange === "1D" ? 20 : 12;

  // Wybór danych
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
  const nowInside = lastItem.inside;
  const nowOutside = lastItem.outside;
  const diff = nowInside - nowOutside;
  const diffStr = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}°C`;

  // Konfiguracja Osi Y w zależności od trybu
  const isDual = mode === "dual";
  const maxValue = isDual ? 30 : 10;
  const yLabels = isDual ? DUAL_Y_LABELS : DELTA_Y_LABELS;
  const sections = isDual ? 6 : 5; // Liczba sekcji = liczba etykiet - 1 (lub dopasowana do etykiet)

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
              ? "Temperatura wewnątrz vs zewnątrz"
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
                            In: {item.value}°C
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
                              Out: {item.value2}°C
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
                  endSpacing={5} // Do końca
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
                  maxValue={maxValue}
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
      )}

      <View style={{ alignItems: "center", marginTop: 8 }}>
        <Text variant="labelSmall" style={{ opacity: 0.5 }}>
          Przytrzymaj wykres, aby sprawdzić punkt
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
          <Text variant="titleMedium">{nowInside.toFixed(1)}°C</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            Ostatni odczyt
          </Text>
        </View>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>
            Na zewnątrz (teraz)
          </Text>
          <Text variant="titleMedium">{nowOutside.toFixed(1)}°C</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            Ostatni odczyt
          </Text>
        </View>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>
            Różnica
          </Text>
          <Text variant="titleMedium">{diffStr}</Text>
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
