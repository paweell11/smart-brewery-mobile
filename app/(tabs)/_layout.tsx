import { Slot } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomBar from "../../components/BottomBar";
import { WebSocketProvider } from "@/providers/WebSocketProvider";
import wssOrigin from "@/constants/wss-origin";

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <WebSocketProvider wssUrl={wssOrigin}>
      <View style={styles.container}>
        <View style={[styles.content, { paddingBottom: 72 + insets.bottom }]}>
          <Slot />
        </View>
        <BottomBar />
      </View>
    </WebSocketProvider>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1 },
});
