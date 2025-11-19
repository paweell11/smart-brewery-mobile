import * as React from "react";
import { StyleSheet, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { SegmentedButtons, Text, useTheme } from "react-native-paper";

type Pt = { value: number; label?: string };

// --- stałe layoutu ---
const Y_LABEL_W = 40;
const LEFT_PAD = 10;
const RIGHT_PAD = Y_LABEL_W + LEFT_PAD;
const CHART_H = 220;

// --- demo-dane (czas wspólny) ---
const TIMES = ["21:00", "21:30", "22:00", "22:30", "23:00"];

const HUMIDITY_DATA: Pt[] = [59, 60, 61, 62, 63].map((v, i) => ({
  value: v,
  label: TIMES[i],
}));

const PRESSURE_RAW = [1004, 1005, 1005, 1006, 1006]; // hPa
const P_BASE = 980;         // dolna granica skali ciśnienia
const P_SPAN = 60;          // 980..1040 => 60
const PRESSURE_DATA: Pt[] = PRESSURE_RAW.map((v, i) => ({
  // przesunięte wartości (żeby skala była 0..60)
  value: v - P_BASE,
  label: TIMES[i],
}));
const PRESSURE_Y_LABELS = ["980","990","1000","1010","1020","1030","1040"];

export default function EnvironmentDetails() {
  const theme = useTheme();
  const [w, setW] = React.useState(0);
  const [mode, setMode] = React.useState<"humidity" | "pressure">("humidity");

  const humidityColor = theme.colors.primary;
  const pressureColor = theme.colors.tertiary;

  const lastHumidity = HUMIDITY_DATA[HUMIDITY_DATA.length - 1];
  const lastPressure = PRESSURE_RAW[PRESSURE_RAW.length - 1];

  const comfortLabel =
    lastHumidity.value < 30 ? "Poniżej" :
    lastHumidity.value > 60 ? "Powyżej" : "W zakresie";

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      <Text variant="titleLarge">Wilgotność i ciśnienie</Text>
      <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 4 }}>
        {mode === "humidity" ? "Wilgotność — podgląd" : "Ciśnienie — podgląd"}
      </Text>

      <SegmentedButtons
        value={mode}
        onValueChange={(v) => setMode(v as any)}
        style={{ marginTop: 10 }}
        buttons={[
          { value: "humidity", label: "Wilgotność" },
          { value: "pressure", label: "Ciśnienie" },
        ]}
      />

      {w > 0 && (
        <View style={{ marginTop: 12 }}>
          {(() => {
            const SHIFT = Math.min(26, Math.round(w * 0.08));
            const end = Math.max(10, RIGHT_PAD - SHIFT);

            if (mode === "humidity") {
              // 0..100% bez żadnych kolorowych zakresów
              return (
                <LineChart
                  width={w}
                  height={CHART_H}
                  data={HUMIDITY_DATA}
                  curved
                  thickness={3}
                  hideRules={false}
                  hideDataPoints
                  yAxisLabelWidth={Y_LABEL_W}
                  initialSpacing={LEFT_PAD}
                  endSpacing={end}
                  yAxisColor={theme.colors.outlineVariant}
                  xAxisColor={theme.colors.outlineVariant}
                  yAxisTextStyle={{ opacity: 0.7 }}
                  xAxisLabelTextStyle={{ opacity: 0.7 }}
                  color1={humidityColor}
                  maxValue={100}
                  noOfSections={10}
                  yAxisLabelSuffix="%"
                  scrollToEnd
                  scrollAnimation={false}
                />
              );
            }

            // tryb „Ciśnienie” – skala 980..1040 hPa z własnymi etykietami
            return (
              <LineChart
                width={w}
                height={CHART_H}
                data={PRESSURE_DATA}
                curved
                thickness={3}
                hideRules={false}
                hideDataPoints
                yAxisLabelWidth={Y_LABEL_W}
                initialSpacing={LEFT_PAD}
                endSpacing={end}
                yAxisColor={theme.colors.outlineVariant}
                xAxisColor={theme.colors.outlineVariant}
                yAxisTextStyle={{ opacity: 0.7 }}
                xAxisLabelTextStyle={{ opacity: 0.7 }}
                color1={pressureColor}
                maxValue={P_SPAN}                         // 0..60
                yAxisLabelTexts={PRESSURE_Y_LABELS}       // „980..1040”
                noOfSections={PRESSURE_Y_LABELS.length - 1}
                yAxisLabelSuffix=" hPa"
                scrollToEnd
                scrollAnimation={false}
              />
            );
          })()}
        </View>
      )}

      {/* Legenda (dostosowana do trybu) */}
      <View style={styles.legend}>
        <View
          style={[
            styles.dot,
            { backgroundColor: mode === "humidity" ? humidityColor : pressureColor },
          ]}
        />
        <Text>
          {mode === "humidity" ? "Wilgotność" : "Ciśnienie"}
        </Text>
      </View>

      {/* 3 kolumny z danymi – jak prosiłeś */}
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
          <Text variant="labelSmall" style={[styles.mutedLabel, styles.centerText]}>
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
          <Text variant="labelSmall" style={[styles.mutedLabel, styles.rightText]}>
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
  legend: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 6,
  },
  dot: { width: 10, height: 10, borderRadius: 6 },
  statsRow: { flexDirection: "row", marginTop: 12 },
  statsColLeft: { flex: 1, alignItems: "flex-start" },
  statsColCenter: { flex: 1, alignItems: "center" },
  statsColRight: { flex: 1, alignItems: "flex-end" },
  mutedLabel: { opacity: 0.7 },
  mutedSmall: { opacity: 0.6 },
  centerText: { textAlign: "center" },
  rightText: { textAlign: "right" },
});
