import { useAuthContext } from "@/hooks/useAuthContext";
import { useRouter } from "expo-router";
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import AccountActionsCard from "../../components/AccountActionsCard";
import FullWidthHeader from "../../components/FullWidthHeader";
import ThemeSelectorCards from "../../components/ThemeSelectorCards";

export default function MoreScreen() {
  const router = useRouter();
  const { /* np. logout */ } = useAuthContext?.() ?? {};

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

        <AccountActionsCard
          onPressProfile={() => {
            // TODO: przejście do profilu użytkownika
            console.log("Mój profil");
          }}
          onPressAbout={() => {
            // TODO: info o aplikacji
            console.log("O aplikacji");
          }}
          onPressLogout={() => {
            // TODO: wylogowanie
            console.log("Wyloguj");
          }}
        />
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
