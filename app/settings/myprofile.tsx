// app/(settings)/myprofile.tsx
import { useAuthContext } from "@/hooks/useAuthContext";
import * as React from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function MyProfileScreen() {
  const theme = useTheme();
  const { userData } = useAuthContext();
  const { firstName, lastName, email } = userData;

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <Text
          variant="titleMedium"
          style={{ color: theme.colors.onBackground, marginBottom: 8 }}
        >
          Mój profil
        </Text>

        <Text
          variant="bodyMedium"
          style={{
            color: theme.colors.onBackground,
            opacity: 0.8,
            lineHeight: 20,
          }}
        >
          {`Imię: ${firstName}, Nazwisko: ${lastName}, E-mail: ${email}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
});
