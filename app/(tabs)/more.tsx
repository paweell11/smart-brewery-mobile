import { StyleSheet, Text, View } from "react-native";
import BottomBar from "../../components/BottomBar";

export default function MoreScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text>Ekran „More” – tutaj dodasz ustawienia itp.</Text>
      </View>
      <BottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 72,
  },
});
