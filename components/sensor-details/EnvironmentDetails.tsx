// components/sensor-details/EnvironmentDetails.tsx
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Text, useTheme } from "react-native-paper";

type Pt = { value: number; label?: string };

// Demo-dane
const HUMIDITY_DATA: Pt[] = [
  { value: 59, label: "21:00" },
  { value: 60, label: "21:30" },
  { value: 61, label: "22:00" },
  { value: 62, label: "22:30" },
  { value: 63, label: "23:00" },
];

const PRESSURE_DATA: number[] = [1004, 1005, 1005, 1006, 1006]; // hPa

const CHART_HEIGHT = 220;
const LEFT_AXIS_WIDTH = 38;
const RIGHT_AXIS_WIDTH = 64;
const LEFT_PADDING = 10;
// mały zapas, żeby nic nie dotykało prawej krawędzi
const CHART_SIDE_PADDING = 10;

export default function EnvironmentDetails() {
  const theme = useTheme();
  const [containerWidth, setContainerWidth] = React.useState(0);

  const humidityColor = theme.colors.primary;
  const pressureColor = theme.colors.tertiary;

  const lastHumidity = HUMIDITY_DATA[HUMIDITY_DATA.length - 1];
  const lastPressure = PRESSURE_DATA[PRESSURE_DATA.length - 1];

  const comfortLabel =
    lastHumidity.value < 30
      ? "Poniżej"
      : lastHumidity.value > 60
      ? "Powyżej"
      : "W zakresie";

  // szerokość przekazywana do LineChart – odejmujemy lewą oś + zapas
  const chartWidth = Math.max(
    0,
    containerWidth - LEFT_AXIS_WIDTH - CHART_SIDE_PADDING
  );

  return (
    <View
      onLayout={(e) => {
        setContainerWidth(e.nativeEvent.layout.width);
      }}
    >
      <Text variant="titleLarge">Wilgotność i ciśnienie</Text>
      <Text variant="bodySmall" style={styles.subtitle}>
        Wilgotność vs ciśnienie — podgląd
      </Text>

      {chartWidth > 0 && (
        <View style={[styles.chartContainer, { paddingRight: CHART_SIDE_PADDING }]}>
          <LineChart
            width={chartWidth}
            height={CHART_HEIGHT}
            data={HUMIDITY_DATA}
            curved
            thickness={3}
            hideDataPoints
            hideRules={false}
            rulesType="dashed"
            rulesColor={theme.colors.outlineVariant}
            initialSpacing={LEFT_PADDING}
            yAxisLabelWidth={LEFT_AXIS_WIDTH}
            endSpacing={RIGHT_AXIS_WIDTH + CHART_SIDE_PADDING}

            // *** zapasy góra/dół + miejsce na etykiety X ***
            overflowTop={8}
            overflowBottom={8}
            xAxisLabelsHeight={20}

            // LEWA OŚ – wilgotność
            maxValue={70}
            noOfSections={7}
            yAxisColor={humidityColor}
            yAxisTextStyle={{ color: humidityColor, opacity: 0.9 }}
            yAxisLabelSuffix="%"
            color={humidityColor}

            // PRAWA OŚ – ciśnienie
            secondaryData={PRESSURE_DATA.map((v, i) => ({
              value: v,
              label: HUMIDITY_DATA[i]?.label,
            }))}
            secondaryLineConfig={{
              color: pressureColor,
              thickness: 3,
            }}
            secondaryYAxis={{
              // zakres 980–1040 hPa
              maxValue: 60, // 1040 - 980
              yAxisOffset: 980,
              noOfSections: 6,
              showFractionalValues: false,
              yAxisColor: pressureColor,
              yAxisTextStyle: { color: pressureColor, opacity: 0.9 },
              yAxisLabelWidth: RIGHT_AXIS_WIDTH,
            }}
            xAxisLabelTextStyle={{ opacity: 0.75 }}
          />
        </View>
      )}

      {/* Legenda */}
      <View style={styles.legend}>
        <View style={[styles.dot, { backgroundColor: humidityColor }]} />
        <Text style={styles.legendLabel}>Wilgotność</Text>

        <View style={[styles.dot, { backgroundColor: pressureColor }]} />
        <Text>Ciśnienie</Text>
      </View>

      {/* 3 kolumny z danymi */}
      <View style={styles.statsRow}>
        <View style={styles.statsColLeft}>
          <Text variant="labelSmall" style={styles.mutedLabel}>
            Wilgotność (teraz)
          </Text>
          <Text variant="titleMedium">{lastHumidity.value}%</Text>
          <Text variant="bodySmall" style={styles.mutedSmall}>
            {lastHumidity.label}
          </Text>
        </View>

        <View style={styles.statsColCenter}>
          <Text
            variant="labelSmall"
            style={[styles.mutedLabel, styles.centerText]}
          >
            Ciśnienie (teraz)
          </Text>
          <Text variant="titleMedium" style={styles.centerText}>
            {lastPressure} hPa
          </Text>
          <Text variant="bodySmall" style={[styles.mutedSmall, styles.centerText]}>
            {lastHumidity.label}
          </Text>
        </View>

        <View style={styles.statsColRight}>
          <Text
            variant="labelSmall"
            style={[styles.mutedLabel, styles.rightText]}
          >
            Komfort wilgotności
          </Text>
          <Text variant="titleMedium" style={styles.rightText}>
            {comfortLabel}
          </Text>
          <Text variant="bodySmall" style={[styles.mutedSmall, styles.rightText]}>
            zakres 30–60%
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    opacity: 0.7,
    marginTop: 4,
  },
  chartContainer: {
    marginTop: 12,
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 6,
    marginRight: 6,
  },
  legendLabel: {
    marginRight: 16,
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  statsColLeft: {
    flex: 1,
    alignItems: "flex-start",
  },
  statsColCenter: {
    flex: 1,
    alignItems: "center",
  },
  statsColRight: {
    flex: 1,
    alignItems: "flex-end",
  },
  mutedLabel: {
    opacity: 0.7,
  },
  mutedSmall: {
    opacity: 0.6,
  },
  centerText: {
    textAlign: "center",
  },
  rightText: {
    textAlign: "right",
  },
});
