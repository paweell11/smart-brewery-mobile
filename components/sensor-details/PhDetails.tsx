import * as React from "react";
import { StyleSheet, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Text, useTheme } from "react-native-paper";

type Pt = { value: number; label?: string };

// stałe wspólne
const Y_LABEL_W = 40;
const LEFT_PAD = 14;
const RIGHT_PAD = Y_LABEL_W + LEFT_PAD;

const PH: Pt[] = [4.9, 4.7, 4.5, 4.4, 4.4, 4.3].map((v, i) => ({
  value: v,
  label: `${8 + i * 2}:00`,
}));

export default function PhDetails() {
  const theme = useTheme();
  const [w, setW] = React.useState(0);

  const rawMax = Math.max(...PH.map(p => p.value));
  const maxVal = rawMax + 0.25;

  // ładne, równe ticki na osi Y (opcjonalne; wygląda spójnie)
  const yAxisLabelTexts = [
    "3.50","3.75","4.00","4.25","4.50","4.75","5.00","5.25","5.50"
  ];

  return (
    <View style={styles.wrap} onLayout={e => setW(e.nativeEvent.layout.width)}>
      <Text variant="titleLarge">pH fermentacji</Text>
      <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 4 }}>
        Dane poglądowe
      </Text>

      {w > 0 && (
        <View style={{ marginTop: 12 }}>
          {(() => {
            const DELTA = Math.min(16, Math.round(w * 0.05));
            const end = Math.max(18, RIGHT_PAD - DELTA);

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
                yAxisTextStyle={{ opacity: 0.7 }}
                xAxisLabelTextStyle={{ opacity: 0.7 }}
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingRight: 0 },
  legend: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  dot: { width: 10, height: 10, borderRadius: 6, marginRight: 6 },
});
