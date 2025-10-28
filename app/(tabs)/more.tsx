import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import FullWidthHeader from "../../components/FullWidthHeader";
import ThemeSelectorCard from "../../components/ThemeSelectorCards";

export default function MoreScreen() {
  const [themeChoice, setThemeChoice] = React.useState<"auto" | "light" | "dark">("dark");

  return (
    <View style={styles.screen}>
        <FullWidthHeader
            title="Moje konto"
            logoSource={require("../../assets/images/brewery-logo.png")}
            align="left"
            size="lg"
        />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ThemeSelectorCard />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
});
