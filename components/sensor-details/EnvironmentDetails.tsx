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
import { HumidityDataType, PressureDataType } from "./types";

// --- KONFIGURACJA WYKRESU ---
const Y_LABEL_W = 40;
const LEFT_PAD = 10;
const CHART_H = 220;
// Stała do korekty szerokości ScrollView
const CONTAINER_PAD = 100;
const SAFE_RIGHT_MARGIN = 0;

// Docelowa liczba punktów na wykresie.
const TARGET_POINTS_COUNT = 40;

// Zakres wilgotności
const HUM_MIN_OK = 30;
const HUM_MAX_OK = 70;

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
const HUMIDITY_OFFSET = 0;

// Ciśnienie 980-1040 co 10
const PRESSURE_LABELS = ["980", "990", "1000", "1010", "1020", "1030", "1040"];
const PRESSURE_OFFSET = 980;
const PRESSURE_RANGE = 60; // 1040 - 980
const PRESSURE_SECTIONS = 6;

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
  // Dla 1D (spacing 20) -> co 4 punkty
  // Dla reszty (spacing 12) -> co 6 punktów
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

export default function EnvironmentDetails() {
  const theme = useTheme();

  // 1. POBIERANIE DANYCH (Dwa niezależne zapytania)
  // Wilgotność
  const humQuery = useSensorData<HumidityDataType[]>({
    sensorPath: "/readings/humidity",
    searchParams: [
      { days: "1" },
      { days: "3" },
      { days: "7" },
      { days: "14" },
      { days: "28" },
    ],
  });

  // Ciśnienie
  const pressQuery = useSensorData<PressureDataType[]>({
    sensorPath: "/readings/pressure",
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
    if (humQuery.data) {
      console.log("=== POBRANE WILGOTNOŚĆ ===");
      humQuery.data.forEach((d, i) =>
        console.log(`Hum Set ${i}: ${d ? d.length : 0} punktów`)
      );
    }
  }, [humQuery.data]);

  React.useEffect(() => {
    if (pressQuery.data) {
      console.log("=== POBRANE CIŚNIENIE ===");
      pressQuery.data.forEach((d, i) =>
        console.log(`Press Set ${i}: ${d ? d.length : 0} punktów`)
      );
    }
  }, [pressQuery.data]);

  const [w, setW] = React.useState(0);
  const [mode, setMode] = React.useState<"humidity" | "pressure">("humidity");
  const [selectedRange, setSelectedRange] = React.useState<RangeType>("1D");

  const spacing = selectedRange === "1D" ? 20 : 12;

  // Kolory
  const humidityColor = theme.colors.primary;
  const pressureColor = theme.colors.tertiary;
  const currentColor = mode === "humidity" ? humidityColor : pressureColor;

  // --- PRZYGOTOWANIE DANYCH DO STATYSTYK (Footer) ---
  // Pobieramy "Najnowsze" wartości z zestawu 1D (najświeższego)
  const latestHumData = humQuery.data?.[0];
  const latestPressData = pressQuery.data?.[0];

  let currentHumValue: number | null = null;
  let currentPressValue: number | null = null;

  if (latestHumData && latestHumData.length > 0) {
    // Sortujemy dla pewności
    const sorted = [...latestHumData].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    currentHumValue = sorted[sorted.length - 1].humidity_percent;
  }

  if (latestPressData && latestPressData.length > 0) {
    const sorted = [...latestPressData].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    currentPressValue = sorted[sorted.length - 1].pressure_hpa;
  }

  // Określenie statusu wilgotności
  let humStatus = "--";
  if (currentHumValue !== null) {
    if (currentHumValue >= HUM_MIN_OK && currentHumValue <= HUM_MAX_OK) {
      humStatus = "W normie";
    } else if (currentHumValue < HUM_MIN_OK) {
      humStatus = "Niska";
    } else {
      humStatus = "Wysoka";
    }
  }

  // --- PRZYGOTOWANIE DANYCH DO WYKRESU ---
  // Wybór surowych danych w zależności od trybu i zakresu
  let rawBackendData: { timestamp: string; value: number }[] = [];
  const activeQuery = mode === "humidity" ? humQuery : pressQuery;
  const activeDataSet = activeQuery.data;

  if (activeDataSet && activeDataSet.length >= 5) {
    let selectedSet: any[] | null = null;
    switch (selectedRange) {
      case "1D":
        selectedSet = activeDataSet[0];
        break;
      case "3D":
        selectedSet = activeDataSet[1];
        break;
      case "7D":
        selectedSet = activeDataSet[2];
        break;
      case "2T":
        selectedSet = activeDataSet[3];
        break;
      case "4T":
        selectedSet = activeDataSet[4];
        break;
      default:
        selectedSet = activeDataSet[0];
    }

    if (selectedSet) {
      // Mapowanie na wspólny format { timestamp, value }
      rawBackendData = selectedSet.map((item: any) => ({
        timestamp: item.timestamp,
        value: mode === "humidity" ? item.humidity_percent : item.pressure_hpa,
      }));
    }
  }

  // Przetwarzanie danych dla wykresu (Downsampling)
  const processedChartData = React.useMemo(() => {
    if (!rawBackendData || rawBackendData.length === 0) {
      return [];
    }

    // Sortowanie
    const fullSortedHistory = [...rawBackendData].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    const nowTimestamp = new Date(
      fullSortedHistory[fullSortedHistory.length - 1].timestamp
    ).getTime();
    const lastVal = fullSortedHistory[fullSortedHistory.length - 1].value;

    // Downsampling
    const totalPoints = fullSortedHistory.length;
    let sampledData = [];

    if (totalPoints <= TARGET_POINTS_COUNT) {
      sampledData = fullSortedHistory.map((item) => ({
        value: item.value,
        timestamp: new Date(item.timestamp),
      }));
    } else {
      const step = Math.ceil(totalPoints / TARGET_POINTS_COUNT);
      for (let i = 0; i < totalPoints; i += step) {
        const item = fullSortedHistory[i];
        sampledData.push({
          value: item.value,
          timestamp: new Date(item.timestamp),
        });
      }

      // Zawsze dodaj ostatni punkt
      const lastSampled = sampledData[sampledData.length - 1];
      if (lastSampled.timestamp.getTime() !== nowTimestamp) {
        sampledData.push({
          value: lastVal,
          timestamp: new Date(nowTimestamp),
        });
      }
    }
    return sampledData;
  }, [rawBackendData]);

  const chartData = React.useMemo(
    () => prepareDataForChart(processedChartData, selectedRange, spacing),
    [processedChartData, selectedRange, spacing]
  );

  const hasData = processedChartData.length > 0;

  // Konfiguracja osi Y
  const isHum = mode === "humidity";
  const yLabels = isHum ? HUMIDITY_LABELS : PRESSURE_LABELS;
  const sections = isHum ? HUMIDITY_SECTIONS : PRESSURE_SECTIONS;
  const maxVal = isHum ? HUMIDITY_MAX : PRESSURE_RANGE;
  const yOffset = isHum ? HUMIDITY_OFFSET : PRESSURE_OFFSET;
  const unit = isHum ? "%" : " hPa";

  const isPending = activeQuery.isPending;

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
          <Text variant="titleLarge">Warunki otoczenia</Text>
          <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 4 }}>
            Wilgotność oraz ciśnienie otoczenia
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
                    // endSpacing = 6 zgodnie z wymaganiem
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
        )
      )}

      <View style={{ alignItems: "center", marginTop: 8 }}>
        <Text variant="labelSmall" style={{ opacity: 0.5 }}>
          {hasData ? "Przytrzymaj wykres, aby sprawdzić punkt" : ""}
        </Text>
      </View>

      <View style={styles.legend}>
        <View style={[styles.dot, { backgroundColor: currentColor }]} />
        <Text>{mode === "humidity" ? "Wilgotność" : "Ciśnienie"}</Text>
      </View>

      {/* STATYSTYKI: Ciśnienie, Wilgotność, Status */}
      <View style={styles.row}>
        {/* Kolumna 1: Wilgotność */}
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>
            Wilgotność (teraz)
          </Text>
          <Text variant="titleMedium">
            {currentHumValue !== null ? `${currentHumValue.toFixed(1)}%` : "--"}
          </Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            Sensor
          </Text>
        </View>

        {/* Kolumna 2: Ciśnienie */}
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>
            Ciśnienie (teraz)
          </Text>
          <Text variant="titleMedium">
            {currentPressValue !== null
              ? `${Math.round(currentPressValue)} hPa`
              : "--"}
          </Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            Barometr
          </Text>
        </View>

        {/* Kolumna 3: Status Wilgotności */}
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>
            Status
          </Text>
          <Text variant="titleMedium">{humStatus}</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            Zakres {HUM_MIN_OK}-{HUM_MAX_OK}%
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
