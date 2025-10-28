// app/(settings)/_layout.tsx
import { Stack, useRouter } from "expo-router";
import * as React from "react";
import { IconButton, useTheme } from "react-native-paper";

export default function SettingsLayout() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.elevation.level2,
        },
        headerTitleAlign: "center",
        headerTitleStyle: {
          color: theme.colors.onSurface,
        },
        headerTintColor: theme.colors.onSurface,
        headerLeft: () => (
          <IconButton
            icon="arrow-left"
            mode="contained"
            style={{
              borderRadius: theme.roundness,
              backgroundColor: theme.colors.elevation.level3,
              marginLeft: 8,
            }}
            iconColor={theme.colors.onSurface}
            onPress={() => router.back()}
          />
        ),
      }}
    >
      <Stack.Screen
        name="myprofile"
        options={{
          title: "Mój profil",
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          title: "O aplikacji",
        }}
      />
    </Stack>
  );
}
