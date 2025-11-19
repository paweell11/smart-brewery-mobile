import * as React from "react";
import { StyleSheet } from "react-native";
import { Card, IconButton, Text } from "react-native-paper";

type Props = { title: string; iconSrc: string; onPress: () => void };

export default function TileCard({ title, iconSrc, onPress }: Props) {
  return (
    <Card style={styles.card} mode="contained" onPress={onPress}>
      <Card.Title
        titleNumberOfLines={2}
        title={title}
        left={() => <IconButton icon={iconSrc} style={{padding: 0, margin: 0}} />}
      />
      <Card.Content>
        <Text variant="bodySmall" style={{ opacity: 0.7 }}>
          Krótki opis…
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    minHeight: 120,
    borderRadius: 12,
  },
});
