import * as React from "react";
import { StyleSheet, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Text, useTheme } from "react-native-paper";

type Pt = { value: number; label?: string };

const Y_LABEL_W = 44;
const LEFT_PAD = 10;
const RIGHT_PAD = Y_LABEL_W + LEFT_PAD;
const CHART_H = 220;

const WEIGHT: Pt[] = [
  { value: 23.10, label: "06:00" }, { value: 23.06, label: "06:30" },
  { value: 23.02, label: "07:00" }, { value: 22.98, label: "07:30" },
  { value: 22.94, label: "08:00" }, { value: 22.91, label: "08:30" },
  { value: 22.88, label: "09:00" }, { value: 22.86, label: "09:30" },
  { value: 22.84, label: "10:00" }, { value: 22.83, label: "10:30" },
  { value: 22.82, label: "11:00" }, { value: 22.80, label: "11:30" },
  { value: 22.79, label: "12:00" }, { value: 22.78, label: "12:30" },
  { value: 22.77, label: "13:00" }, { value: 22.76, label: "13:30" },
  { value: 22.75, label: "14:00" }, { value: 22.73, label: "14:30" },
  { value: 22.71, label: "15:00" }, { value: 22.69, label: "15:30" },
  { value: 22.68, label: "16:00" }, { value: 22.66, label: "16:30" },
  { value: 22.64, label: "17:00" }, { value: 22.63, label: "17:30" },
  { value: 22.62, label: "18:00" }, { value: 22.61, label: "18:30" },
  { value: 22.60, label: "19:00" }, { value: 22.59, label: "19:30" },
  { value: 22.58, label: "20:00" }, { value: 22.57, label: "20:30" },
  { value: 22.56, label: "21:00" }, { value: 22.55, label: "21:30" },
  { value: 22.54, label: "22:00" },
];

const STEP = 0.1;      
const PADDING = 0.2;   

function roundDown(v: number, step: number) {
  return Math.floor(v / step) * step;
}
function roundUp(v: number, step: number) {
  return Math.ceil(v / step) * step;
}

export default function WeightDetails() {
  const theme = useTheme();
  const [w, setW] = React.useState(0);

  const rawMin = Math.min(...WEIGHT.map(p => p.value));
  const rawMax = Math.max(...WEIGHT.map(p => p.value));
  const baseY  = roundDown(rawMin - PADDING, STEP);
  const topY   = roundUp(rawMax + PADDING, STEP);
  const rangeY = +(topY - baseY).toFixed(2);

  const PLOT = WEIGHT.map(p => ({ value: +(p.value - baseY).toFixed(3), label: p.label }));

  const sections = Math.max(4, Math.round(rangeY / STEP)); 
  const labels: string[] = Array.from({ length: sections + 1 }, (_, i) => {
    const v = +(baseY + (rangeY * i) / sections).toFixed(2);
    return `${v.toFixed(1)} kg`;
  });

  const now = WEIGHT[WEIGHT.length - 1];
  const ratePerDay = -0.6; 
  const activity =
    Math.abs(ratePerDay) >= 0.8 ? "wysoka" :
    Math.abs(ratePerDay) >= 0.3 ? "średnia" : "niska";

  return (
    <View style={styles.wrap} onLayout={e => setW(e.nativeEvent.layout.width)}>
      <Text variant="titleLarge">Masa fermentora</Text>
      <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 4 }}>
        Waga - poglądowo
      </Text>

      {w > 0 && (
        <View style={{ marginTop: 12 }}>
          {(() => {
            const SHIFT = Math.min(26, Math.round(w * 0.08));
            const end = Math.max(10, RIGHT_PAD - SHIFT);

            return (
              <LineChart
                width={w}
                height={CHART_H}
                data={PLOT}
                curved
                thickness={3}
                hideRules={false}
                yAxisLabelWidth={Y_LABEL_W}
                initialSpacing={LEFT_PAD}
                endSpacing={end}
                yAxisColor={theme.colors.outlineVariant}
                xAxisColor={theme.colors.outlineVariant}
                yAxisTextStyle={{ opacity: 0.7, color: "white" }}
                xAxisLabelTextStyle={{ opacity: 0.7, color: "white" }}
                color1={theme.colors.primary}
                maxValue={rangeY}               
                yAxisLabelTexts={labels}       
                noOfSections={labels.length - 1}
                scrollToEnd
                scrollAnimation={false}
                hideDataPoints
              />
            );
          })()}
        </View>
      )}

      <View style={styles.legend}>
        <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
        <Text>Masa</Text>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>Obecnie</Text>
          <Text variant="titleMedium">{now.value.toFixed(2)} kg</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>{now.label}</Text>
        </View>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>Tempo</Text>
          <Text variant="titleMedium">
            {ratePerDay >= 0 ? "+" : ""}{ratePerDay.toFixed(2)} kg/dobę
          </Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>szacunek</Text>
        </View>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>Aktywność</Text>
          <Text variant="titleMedium">
            {activity.charAt(0).toUpperCase() + activity.slice(1)}
          </Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            wg tempa zmian
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingRight: 0 },
  legend: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  dot: { width: 10, height: 10, borderRadius: 6, marginRight: 6 },
  row: { flexDirection: "row", gap: 12, marginTop: 12 },
  col: { flex: 1 },
});
