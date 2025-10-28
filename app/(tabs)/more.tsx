// app/(tabs)/more.tsx
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import FullWidthHeader from "../../components/FullWidthHeader";
import ThemeSelectorCard from "../../components/ThemeSelectorCards";

export default function MoreScreen() {
  // lokalny state tylko wizualnie zaznacza wybór
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
        // ScrollView dlatego że docelowo będą kolejne sekcje (konto, o aplikacji itd.)
        showsVerticalScrollIndicator={false}
      >
        <ThemeSelectorCard
          value={themeChoice}
          onChange={(choice) => setThemeChoice(choice)}
        />

        {/* tu później dodamy np. dane konta, wyloguj itd. */}
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
