import * as React from "react";
import { View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { useTheme } from "react-native-paper";

type Point = { value: number; label?: string };

type Props = {
  data: Point[];
  height?: number;
  maxValue?: number;   
};

export default function BaseLineChart({ data, height = 220, maxValue }: Props) {
  const theme = useTheme();
  const [w, setW] = React.useState(0);

  return (
    <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ width: "100%" }}>
      {w > 0 && (
        <LineChart
          width={w}
          height={height}
          data={data}
          curved
          thickness={3}
          hideRules={false}
          yAxisColor={theme.colors.outlineVariant}
          xAxisColor={theme.colors.outlineVariant}
          yAxisTextStyle={{ opacity: 0.7 }}
          xAxisLabelTextStyle={{ opacity: 0.7 }}
          yAxisLabelWidth={32}   
          initialSpacing={10}
          endSpacing={28}        
          color1={theme.colors.primary}
          maxValue={maxValue}
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
