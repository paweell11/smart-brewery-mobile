import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Divider, Text, useTheme } from "react-native-paper";

export function DetailsScaffold({
  title, subtitle, chart, legend, statsTop, statsBottom,
}: {
  title: string;
  subtitle?: string;
  chart: React.ReactNode;
  legend?: React.ReactNode;
  statsTop?: React.ReactNode;
  statsBottom?: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View>
      <Text variant="titleLarge">{title}</Text>
      {subtitle ? (
        <Text variant="bodySmall" style={{ opacity: 0.7, marginTop: 4 }}>{subtitle}</Text>
      ) : null}

      <View style={{ marginTop: 12 }}>{chart}</View>
      {legend}

      <Divider style={{ marginVertical: 12 }} />

      {statsTop}
      {statsBottom ? <View style={{ marginTop: 8 }}>{statsBottom}</View> : null}
    </View>
  );
}

export function StatRow({ items }: { items: { label: string; value: string }[] }) {
  return (
    <View style={styles.row}>
      {items.map((it) => (
        <View key={it.label} style={{ flex: 1 }}>
          <Text variant="labelSmall" style={{ opacity: 0.7 }}>{it.label}</Text>
          <Text variant="titleMedium">{it.value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 12 },
});
