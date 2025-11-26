import * as React from "react";
import { StyleSheet, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Text, useTheme } from "react-native-paper";

type Pt = { value: number; label?: string };

const Y_LABEL_W = 40;
const LEFT_PAD = 10;
const RIGHT_PAD = Y_LABEL_W + LEFT_PAD;

const FIXED_MAX = 30; 
const CHART_H = 220;  
const Y_LABELS = ["0", "5", "10", "15", "20", "25", "30"].map(v => `${v}°`);

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

const TARGET_MIN = 16;
const TARGET_MAX = 24;


const BG_TOP_SHIFT = 10; 
const BG_HEIGHT_CORRECTION = 0; 

export default function InsideTemperatureDetails() {
  const theme = useTheme();
  const [w, setW] = React.useState(0);

  const vividGreen = "#16a34a"; 

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

  const refLineConfig = {
    color: vividGreen,
    thickness: 1,
    type: 'dashed' as const, 
    dashWidth: 10,
    dashGap: 8,
    labelText: '',
    labelTextStyle: { color: vividGreen, fontSize: 13, fontWeight: '700', marginBottom: 4 }
  };

  return (
    <View 
      style={styles.wrap} 
      onLayout={e => {
        const width = e.nativeEvent.layout.width;
        if (width > 0 && Math.abs(w - width) > 1) {
          setW(width);
        }
      }}
    >
      <Text variant="titleLarge">Temperatura wewnętrzna</Text>
      <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 4 }}>
        Pas docelowy {TARGET_MIN}–{TARGET_MAX}°C (poglądowo)
      </Text>

      {w > 0 && (
        <View style={{ marginTop: 12, position: 'relative' }}>
          {(() => {
            const SHIFT = Math.min(26, Math.round(w * 0.08));
            const end = Math.max(10, RIGHT_PAD - SHIFT);
            
            const pxPerDegree = CHART_H / FIXED_MAX;

            const topOffsetBase = (FIXED_MAX - TARGET_MAX) * pxPerDegree;
            const topOffset = topOffsetBase + BG_TOP_SHIFT;

            const bandHeightBase = (TARGET_MAX - TARGET_MIN) * pxPerDegree;
            const bandHeight = bandHeightBase + BG_HEIGHT_CORRECTION;
            const WIDTH_BUFFER = 70; 

            return (
              <>
                {/* Tło zakresu */}
                <View 
                    style={{
                        position: 'absolute',
                        left: Y_LABEL_W,
                        top: topOffset,
                        width: w - Y_LABEL_W + WIDTH_BUFFER,
                        height: bandHeight,
                        backgroundColor: 'rgba(22, 163, 74, 0.12)', 
                        zIndex: 0,
                    }}
                />
                
                <LineChart
                    key={w} 
                    width={w}
                    height={CHART_H}
                    data={INSIDE}
                    
                    showReferenceLine1
                    referenceLine1Position={TARGET_MAX}
                    referenceLine1Config={{
                        ...refLineConfig,
                        labelText: `Max ${TARGET_MAX}°C`,
                    }}
                    showReferenceLine2
                    referenceLine2Position={TARGET_MIN}
                    referenceLine2Config={{
                        ...refLineConfig,
                        labelText: `Min ${TARGET_MIN}°C`,
                    }}
                    
                    curved
                    thickness={3}           
                    hideRules={false}
                    yAxisLabelWidth={Y_LABEL_W}
                    initialSpacing={LEFT_PAD}
                    endSpacing={end}
                    yAxisColor={theme.colors.outlineVariant}
                    xAxisColor={theme.colors.outlineVariant}
                    yAxisTextStyle={{ opacity: 0.7, color: theme.colors.onBackground }}
                    xAxisLabelTextStyle={{ opacity: 0.7, color: theme.colors.onBackground }}
                    color={theme.colors.primary}
                    maxValue={FIXED_MAX}
                    yAxisLabelTexts={Y_LABELS}
                    noOfSections={Y_LABELS.length - 1}
                    scrollToEnd
                    scrollAnimation={false}
                    hideDataPoints
                />
            </>
            );
          })()}
        </View>
      )}

      <View style={styles.legend}>
        <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
        <Text style={{ marginRight: 16 }}>Wewnątrz</Text>

        <View style={styles.legendItem}>
            <View style={[styles.dashLine, { borderColor: vividGreen }]} />
            <Text style={styles.legendLabel}>Zakres {TARGET_MIN}–{TARGET_MAX} °C</Text>
        </View>
      </View>


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
  wrap: { paddingRight: 0 },
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
    borderStyle: 'dashed',
  },
  legendLabel: {},
  row: { flexDirection: "row", gap: 12, marginTop: 12 },
  col: { flex: 1 },
});
