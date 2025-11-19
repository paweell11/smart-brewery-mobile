// app/(settings)/about.tsx
import * as React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

export default function AboutScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text
          variant="titleMedium"
          style={[styles.heading, { color: theme.colors.onBackground }]}
        >
          W aplikacji Smart Brewery możesz:
        </Text>

        <Text
          variant="bodyMedium"
          style={[styles.listText, { color: theme.colors.onBackground }]}
        >
          {"\u2022"} monitorować rózne parametry warzonego piwa dzięki odczytom wartosci z czujników{"\n"}
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 80, // żeby nie weszło pod przycisk na dole
  },
  heading: {
    marginBottom: 16,
  },
  listText: {
    lineHeight: 22,
  },
});
