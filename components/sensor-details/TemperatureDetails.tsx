// components/sensor-details/TemperatureDetails.tsx
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Text, useTheme } from "react-native-paper";

type Pt = { value: number; label?: string };

// stałe wspólne
const Y_LABEL_W = 30;                 // szerokość etykiet osi Y
const LEFT_PAD = 12;                  // lewy margines (initialSpacing)
const RIGHT_PAD = Y_LABEL_W + LEFT_PAD; // bazowy prawy margines

const INSIDE: Pt[] = [
  { value: 21.1, label: "06:00" },
  { value: 21.2, label: "06:30" },
  { value: 21.4, label: "07:00" },
  { value: 21.5, label: "07:30" },
  { value: 21.6, label: "08:00" },
  { value: 21.7, label: "08:30" },
  { value: 21.9, label: "09:00" },
  { value: 22.0, label: "09:30" },
  { value: 22.1, label: "10:00" },
  { value: 22.2, label: "10:30" },
  { value: 22.2, label: "11:00" },
  { value: 22.3, label: "11:30" },
  { value: 22.4, label: "12:00" },
  { value: 22.5, label: "12:30" },
  { value: 22.6, label: "13:00" },
  { value: 22.6, label: "13:30" },
  { value: 22.6, label: "14:00" },
  { value: 22.6, label: "14:30" },
  { value: 22.5, label: "15:00" },
  { value: 22.4, label: "15:30" },
  { value: 22.3, label: "16:00" },
  { value: 22.2, label: "16:30" },
  { value: 22.1, label: "17:00" },
  { value: 22.1, label: "17:30" },
  { value: 22.0, label: "18:00" },
  { value: 21.9, label: "18:30" },
  { value: 21.8, label: "19:00" },
  { value: 21.7, label: "19:30" },
  { value: 21.6, label: "20:00" },
  { value: 21.5, label: "20:30" },
  { value: 21.4, label: "21:00" },
  { value: 21.3, label: "21:30" },
  { value: 21.2, label: "22:00" },
];

const OUTSIDE: Pt[] = [
  { value: 18.8, label: "06:00" },
  { value: 18.9, label: "06:30" },
  { value: 19.1, label: "07:00" },
  { value: 19.2, label: "07:30" },
  { value: 19.4, label: "08:00" },
  { value: 19.5, label: "08:30" },
  { value: 19.6, label: "09:00" },
  { value: 19.8, label: "09:30" },
  { value: 19.9, label: "10:00" },
  { value: 19.9, label: "10:30" },
  { value: 20.0, label: "11:00" },
  { value: 20.0, label: "11:30" },
  { value: 20.1, label: "12:00" },
  { value: 20.2, label: "12:30" },
  { value: 20.2, label: "13:00" },
  { value: 20.2, label: "13:30" },
  { value: 20.2, label: "14:00" },
  { value: 20.1, label: "14:30" },
  { value: 20.1, label: "15:00" },
  { value: 20.0, label: "15:30" },
  { value: 19.8, label: "16:00" },
  { value: 19.8, label: "16:30" },
  { value: 19.7, label: "17:00" },
  { value: 19.6, label: "17:30" },
  { value: 19.5, label: "18:00" },
  { value: 19.4, label: "18:30" },
  { value: 19.3, label: "19:00" },
  { value: 19.2, label: "19:30" },
  { value: 19.1, label: "20:00" },
  { value: 19.0, label: "20:30" },
  { value: 18.9, label: "21:00" },
  { value: 18.8, label: "21:30" },
  { value: 18.7, label: "22:00" },
];

export default function TemperatureDetails() {
  const theme = useTheme();
  const [w, setW] = React.useState(0);

  // delikatny zapas u góry
  const maxVal =
    Math.max(...INSIDE.map(p => p.value), ...OUTSIDE.map(p => p.value)) + 0.4;

  // "teraz" – ostatnie punkty + różnica
  const nowInside = INSIDE[INSIDE.length - 1];
  const nowOutside = OUTSIDE[OUTSIDE.length - 1];
  const diff = nowInside.value - nowOutside.value;
  const diffStr = `${diff >= 0 ? "+" : ""}${diff.toFixed(1)}°C`;

  return (
    <View style={styles.wrap} onLayout={e => setW(e.nativeEvent.layout.width)}>
      <Text variant="titleLarge">Temperatura fermentacji</Text>
      <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 4 }}>
        Wewnątrz vs otoczenie — dane poglądowe
      </Text>

      {w > 0 && (
        <View style={{ marginTop: 12 }}>
          {(() => {
            // przesunięcie w lewo proporcjonalne do szerokości (max 16–20 px)
            const DELTA = Math.min(20, Math.round(w * 0.05));
            const end = Math.max(18, RIGHT_PAD - DELTA);

            return (
              <LineChart
                width={w}
                height={220}
                data={INSIDE}
                data2={OUTSIDE}
                curved
                thickness={3}
                thickness2={3}
                hideRules={false}
                yAxisLabelWidth={Y_LABEL_W}
                initialSpacing={LEFT_PAD}
                endSpacing={end}
                yAxisColor={theme.colors.outlineVariant}
                xAxisColor={theme.colors.outlineVariant}
                yAxisTextStyle={{ opacity: 0.7 }}
                xAxisLabelTextStyle={{ opacity: 0.7 }}
                color1={theme.colors.primary}
                color2={theme.colors.tertiary}
                maxValue={maxVal}
                scrollToEnd
                scrollAnimation={false}
                hideDataPoints
              />
            );
          })()}
        </View>
      )}

      {/* legenda */}
      <View style={styles.legend}>
        <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
        <Text style={{ marginRight: 16 }}>Wewnątrz</Text>
        <View style={[styles.dot, { backgroundColor: theme.colors.tertiary }]} />
        <Text>Otoczenie</Text>
      </View>

      {/* status „teraz” */}
      <View style={styles.row}>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>Wewnątrz (teraz)</Text>
          <Text variant="titleMedium">{nowInside.value.toFixed(1)}°C</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>{nowInside.label}</Text>
        </View>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>Na zewnątrz (teraz)</Text>
          <Text variant="titleMedium">{nowOutside.value.toFixed(1)}°C</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>{nowOutside.label}</Text>
        </View>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>Różnica (teraz)</Text>
          <Text variant="titleMedium">{diffStr}</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>In–Out</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingRight: 0 },
  legend: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  dot: { width: 10, height: 10, borderRadius: 6, marginRight: 6 },
  row: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  col: { flex: 1 },
});
