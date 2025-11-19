// components/sensor-details/InsideTemperatureDetails.tsx
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Text, useTheme } from "react-native-paper";

type Pt = { value: number; label?: string };

// --- stałe skali / layoutu ---
const Y_LABEL_W = 40;
const LEFT_PAD = 10;
const RIGHT_PAD = Y_LABEL_W + LEFT_PAD;
const FIXED_MAX = 30;
const Y_LABELS = ["0", "5", "10", "15", "20", "25", "30"].map(v => `${v}°`);
const CHART_H = 220;

// --- dane poglądowe (wewnątrz) ---
const INSIDE: Pt[] = [
  { value: 21.1, label: "06:00" }, { value: 21.2, label: "06:30" },
  { value: 21.4, label: "07:00" }, { value: 21.5, label: "07:30" },
  { value: 21.6, label: "08:00" }, { value: 21.7, label: "08:30" },
  { value: 21.9, label: "09:00" }, { value: 22.0, label: "09:30" },
  { value: 22.1, label: "10:00" }, { value: 22.2, label: "10:30" },
  { value: 22.2, label: "11:00" }, { value: 22.3, label: "11:30" },
  { value: 22.4, label: "12:00" }, { value: 22.5, label: "12:30" },
  { value: 22.6, label: "13:00" }, { value: 22.6, label: "13:30" },
  { value: 22.6, label: "14:00" }, { value: 22.6, label: "14:30" },
  { value: 22.5, label: "15:00" }, { value: 22.4, label: "15:30" },
  { value: 22.3, label: "16:00" }, { value: 22.2, label: "16:30" },
  { value: 22.1, label: "17:00" }, { value: 22.1, label: "17:30" },
  { value: 22.0, label: "18:00" }, { value: 21.9, label: "18:30" },
  { value: 21.8, label: "19:00" }, { value: 21.7, label: "19:30" },
  { value: 21.6, label: "20:00" }, { value: 21.5, label: "20:30" },
  { value: 21.4, label: "21:00" }, { value: 21.3, label: "21:30" },
  { value: 21.2, label: "22:00" },
];

// --- pas docelowy (dwie linie) ---
const TARGET_MIN = 16;
const TARGET_MAX = 24;

// pomocnicze: z INSIDE robimy dwie „płaskie” serie na 24°C i 16°C
const guidesFrom = (val: number) => INSIDE.map(p => ({ value: val, label: p.label }));
const GUIDE_TOP = guidesFrom(TARGET_MAX);
const GUIDE_BOTTOM = guidesFrom(TARGET_MIN);

export default function InsideTemperatureDetails() {
  const theme = useTheme();
  const [w, setW] = React.useState(0);

  const vividGreen = "#16a34a"; // żywszy zielony (tailwind green-600)

  const now = INSIDE[INSIDE.length - 1];
  const status =
    now.value < TARGET_MIN ? "Poniżej" :
    now.value > TARGET_MAX ? "Powyżej" : "W zakresie";

  const distToLower = Math.abs(now.value - TARGET_MIN);
  const distToUpper = Math.abs(TARGET_MAX - now.value);
  const closer = distToLower <= distToUpper ? "dolnej" : "górnej";
  const deltaVal =
    closer === "dolnej" ? (now.value - TARGET_MIN) : (TARGET_MAX - now.value);
  const deltaStr = `${deltaVal >= 0 ? "+" : ""}${deltaVal.toFixed(1)} °C do ${closer}`;

  return (
    <View style={styles.wrap} onLayout={e => setW(e.nativeEvent.layout.width)}>
      <Text variant="titleLarge">Temperatura wewnętrzna</Text>
      <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 4 }}>
        Pas docelowy {TARGET_MIN}–{TARGET_MAX}°C (poglądowo)
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
                data={INSIDE}           // główna seria
                data2={GUIDE_TOP}       // 24°C
                data3={GUIDE_BOTTOM}    // 16°C
                curved
                thickness={3}           // główna linia
                thickness2={5}          // ⬅️ grubiej dla 24°C
                thickness3={5}          // ⬅️ grubiej dla 16°C
                hideRules={false}
                yAxisLabelWidth={Y_LABEL_W}
                initialSpacing={LEFT_PAD}
                endSpacing={end}
                yAxisColor={theme.colors.outlineVariant}
                xAxisColor={theme.colors.outlineVariant}
                yAxisTextStyle={{ opacity: 0.7 }}
                xAxisLabelTextStyle={{ opacity: 0.7 }}
                color1={theme.colors.primary}
                color2={vividGreen}
                color3={vividGreen}
                maxValue={FIXED_MAX}
                yAxisLabelTexts={Y_LABELS}
                noOfSections={Y_LABELS.length - 1}
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
        {/* seria główna */}
        <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
        <Text style={{ marginRight: 16 }}>Wewnątrz</Text>

        {/* zakres 16–24 °C (górna/dolna w jednej pozycji) */}
        <View style={styles.legendItem}>
            <View style={styles.bandSample}>
            <View style={[styles.legendLine, { borderColor: vividGreen }]} />
            <View style={[styles.legendLine, { borderColor: vividGreen, marginTop: 2 }]} />
            </View>
            <Text style={styles.legendLabel}>Docelowy zakres 16–24 °C</Text>
        </View>
        </View>


      {/* 3 pola informacyjne */}
      <View style={styles.row}>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>Wewnątrz (teraz)</Text>
          <Text variant="titleMedium">{now.value.toFixed(1)} °C</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>{now.label}</Text>
        </View>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>Status</Text>
          <Text variant="titleMedium">{status}</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>
            vs pasmo {TARGET_MIN}–{TARGET_MAX} °C
          </Text>
        </View>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>Δ do granicy</Text>
          <Text variant="titleMedium">{deltaStr}</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>bliższa</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // kontener sekcji (używany na górze komponentu)
  wrap: { paddingRight: 0 },

  // legenda pod wykresem
  legend: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  dot: { width: 10, height: 10, borderRadius: 6, marginRight: 6 },

  legendItem: { flexDirection: "row", alignItems: "center" },
  bandSample: {
    width: 26,
    justifyContent: "center",
    marginRight: 6,
  },
  legendLine: {
    borderTopWidth: 5,       // gruba próbka
    borderStyle: "dashed",   // przerywana
    borderRadius: 2,
  },
  legendLabel: {},

  // 3 pola informacyjne pod legendą
  row: { flexDirection: "row", gap: 12, marginTop: 12 },
  col: { flex: 1 },
});
