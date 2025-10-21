import { StyleSheet, Text, View } from "react-native";
import FullWidthHeader from "../../components/FullWidthHeader";

export default function MoreScreen() {
  return (
    <View style={styles.container}>
        <FullWidthHeader
            title="Moje konto"
            logoSource={require("../../assets/images/brewery-logo.png")}
            align="left"
            size="lg"
        />
      <Text>Ekran „More” – tutaj dodasz ustawienia itp.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    // justifyContent: "center",
  },
});
