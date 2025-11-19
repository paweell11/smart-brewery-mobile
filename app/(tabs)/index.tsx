import * as React from "react";
import { Dimensions, FlatList, StyleSheet, View } from "react-native";
import { IconButton, Modal, Portal, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FullWidthHeader from "../../components/FullWidthHeader";
import SensorDetailsModal from "../../components/SensorDetailsModal";
import TileCard from "../../components/TileCard";

type SensorType = "temp" | "ph" | "insideTemp" | "weight" | "environment" ;
type Item = { id: string; title: string; type: SensorType };

const DATA: Item[] = [
  { id: "t1", title: "Temperatura wew/zew", type: "temp" },
  { id: "t2", title: "Temperatura wewnątrz fermentora", type: "insideTemp" },
  { id: "p1", title: "pH", type: "ph" },
  { id: "w1", title: "Waga", type: "weight" },
  { id: "e1", title: "Wilgotność i ciśnienie", type: "environment" },
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
    winH - headerH - (BOTTOM_BAR_HEIGHT + insets.bottom) - V_MARGIN * 2;

  const MAX_H = Math.max(320, Math.min(availableH, winH * 0.92));
  const MIN_H = Math.min(560, MAX_H);

  return (
    <View style={styles.screen}>
      <FullWidthHeader title="Czujniki" align="center" onMeasuredHeight={setHeaderH} />
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
          <IconButton
            icon="close"
            onPress={() => setSelected(null)}
            style={styles.closeBtn}
            accessibilityLabel="Zamknij"
          />

          {selected && (
            <SensorDetailsModal
              type={selected.type}
            />
          )}
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  listContent: { paddingTop: 16, paddingBottom: 24 },
  modalContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    paddingRight: 56,
    alignSelf: "center",
    width: "92%",
    position: "relative",
    overflow: "hidden", 
  },
  closeBtn: {
    position: "absolute",
    top: 4,
    right: 4,
    zIndex: 2,
  },
});
