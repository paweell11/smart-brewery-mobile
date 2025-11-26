import * as React from "react";
import { StyleSheet, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Text, useTheme } from "react-native-paper";

type Pt = { value: number; label?: string };

const Y_LABEL_W = 40;
const LEFT_PAD = 10;
const RIGHT_PAD = Y_LABEL_W + LEFT_PAD;


const PH: Pt[] = [
  { value: 4.90, label: "08:00" },
  { value: 4.70, label: "10:00" },
  { value: 4.50, label: "12:00" },
  { value: 4.40, label: "14:00" },
  { value: 4.40, label: "16:00" },
  { value: 4.30, label: "18:00" },
];

export default function PhDetails() {
  const theme = useTheme();
  const [w, setW] = React.useState(0);

  
  const rawMax = Math.max(...PH.map(p => p.value));
  const maxVal = rawMax + 0.25;

  
  const yAxisLabelTexts = [
    "3.50","3.75","4.00","4.25","4.50","4.75","5.00","5.25","5.50"
  ];

  
  const now = PH[PH.length - 1];     
  const PH_TREND_1H = "-0.03";       
  const PH_AVG = "4.55";             
  const PH_MIN = "4.30";             
  const PH_MAX = "4.90";             

  return (
    <View style={styles.wrap} onLayout={e => setW(e.nativeEvent.layout.width)}>
      <Text variant="titleLarge">pH fermentacji</Text>
      <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 4 }}>
        Dane poglądowe
      </Text>

      {w > 0 && (
        <View style={{ marginTop: 12 }}>
          {(() => {
            const DELTA = Math.min(26, Math.round(w * 0.08));
            const end = Math.max(10, RIGHT_PAD - DELTA); // lekko mocniej w lewo

            return (
              <LineChart
                width={w}
                height={220}
                data={PH}
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
                color1={theme.colors.primary}
                maxValue={maxVal}
                yAxisLabelTexts={yAxisLabelTexts}
                noOfSections={yAxisLabelTexts.length - 1}
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
        <Text>pH</Text>
      </View>
      <View style={styles.row}>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>pH (teraz)</Text>
          <Text variant="titleMedium">{now.value.toFixed(2)}</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>{now.label}</Text>
        </View>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>Trend (1h)</Text>
          <Text variant="titleMedium">{PH_TREND_1H}</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>Δ pH</Text>
        </View>
        {/* <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>Średnia</Text>
          <Text variant="titleMedium">{PH_AVG}</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>z zakresu</Text>
        </View> */}
      </View>

      {/* <View style={[styles.row, { marginTop: 8 }]}>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>Min</Text>
          <Text variant="titleMedium">{PH_MIN}</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>z zakresu</Text>
        </View>
        <View style={styles.col}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>Max</Text>
          <Text variant="titleMedium">{PH_MAX}</Text>
          <Text variant="bodySmall" style={{ opacity: 0.6 }}>z zakresu</Text>
        </View>
        <View style={styles.col} />
      </View> */}
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
