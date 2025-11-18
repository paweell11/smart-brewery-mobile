// DualLineChart.tsx
import * as React from "react";
import { View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useTheme } from "react-native-paper";

type Point = { value: number; label?: string };
type Props = { data1: Point[]; data2: Point[]; height?: number };

export default function DualLineChart({ data1, data2, height = 220 }: Props) {
  const theme = useTheme();
  const [w, setW] = React.useState(0);

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ width: "100%" }}>
      {w > 0 && (
        <LineChart
          width={w}
          height={height}
          data={data1}
          data2={data2}
          curved
          thickness={3}
          thickness2={3}
          hideRules={false}
          yAxisColor={theme.colors.outlineVariant}
          xAxisColor={theme.colors.outlineVariant}
          yAxisTextStyle={{ opacity: 0.7 }}
          xAxisLabelTextStyle={{ opacity: 0.7 }}
          yAxisLabelWidth={28}
          initialSpacing={10}
          endSpacing={28}
          color1={theme.colors.primary}
          color2={theme.colors.tertiary}
          pointerConfig={{
            showPointerStrip: true,
            pointerStripColor: theme.colors.outline,
            pointerStripUptoDataPoint: true,
            pointerColor: theme.colors.onSurface,
            radius: 4,
          } as any}
        />
      )}
    </View>
  );
}
