import * as React from "react";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";
import { IconButton, Modal, Portal, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FullWidthHeader from "../../components/FullWidthHeader";
import TileCard from "../../components/TileCard";

type Item = { id: string; title: string };
const DATA: Item[] = [
  { id: "1", title: "Kafelek A" },
  { id: "2", title: "Kafelek B" },
  { id: "3", title: "Kafelek C" },
  { id: "4", title: "Kafelek D" },
  { id: "11", title: "Kafelek A" },
  { id: "12", title: "Kafelek B" },
  { id: "13", title: "Kafelek C" },
  { id: "14", title: "Kafelek D" },
  { id: "21", title: "Kafelek A" },
  { id: "22", title: "Kafelek B" },
  { id: "23", title: "Kafelek C" },
  { id: "24", title: "Kafelek D" },
];


const BOTTOM_BAR_HEIGHT = 72;
const V_MARGIN = 8;

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const winH = Dimensions.get("window").height;

  const [selected, setSelected] = React.useState<Item | null>(null);
  const [headerH, setHeaderH] = React.useState(0);

  const availableH =
    winH
    - headerH
    - (BOTTOM_BAR_HEIGHT + insets.bottom)
    - V_MARGIN * 2;


  const MAX_H = Math.max(320, Math.min(availableH, winH * 0.88));
  const MIN_H = Math.min(420, MAX_H);

  return (
    <View style={styles.screen}>
      <FullWidthHeader
        title="Czujniki"
        align="left"
        onMeasuredHeight={setHeaderH} 
      />

      <FlatList
        data={DATA}
        keyExtractor={(it) => it.id}
        numColumns={1}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <TileCard title={item.title} onPress={() => setSelected(item)} />
        )}
      />

      <Portal>
        <Modal
          visible={!!selected}
          onDismiss={() => setSelected(null)}
          contentContainerStyle={[
            styles.modalContainer,
            {
              backgroundColor: theme.colors.background,
              marginTop: V_MARGIN + headerH,
              marginBottom: V_MARGIN + BOTTOM_BAR_HEIGHT + insets.bottom,
              maxHeight: MAX_H,
              minHeight: MIN_H,
            },
          ]}
        >
          {/* X na stałe w prawym górnym */}
          <IconButton
            icon="close"
            onPress={() => setSelected(null)}
            style={styles.closeBtn}
            accessibilityLabel="Zamknij"
          />

          <Text variant="headlineSmall" style={{ marginBottom: 12 }}>
            {selected?.title}
          </Text>
          <Text>Statystyki...</Text>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  listContent: {
    paddingTop: 16,    
    paddingBottom: 24,
  },
  modalContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    alignSelf: "center",
    width: "92%",
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    zIndex: 2,
  },
});
