import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";
import AccountActionsCard from "../../components/AccountActionsCard";
import FullWidthHeader from "../../components/FullWidthHeader";
import ThemeSelectorCards from "../../components/ThemeSelectorCards";

export default function MoreScreen() {
  const theme = useTheme();

  return (
    <View style={{ ...styles.screen, backgroundColor: theme.colors.background }}>
      <FullWidthHeader
        title="Więcej"
        logoSource={require("../../assets/images/brewery-logo-no-title.png")}
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
