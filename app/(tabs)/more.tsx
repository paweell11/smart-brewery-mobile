import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import AccountActionsCard from "../../components/AccountActionsCard";
import FullWidthHeader from "../../components/FullWidthHeader";
import ThemeSelectorCards from "../../components/ThemeSelectorCards";

export default function MoreScreen() {
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
        <ThemeSelectorCards />

        <AccountActionsCard />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingBottom: 32,
  },
});
