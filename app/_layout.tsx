import { useAuthContext } from "@/hooks/useAuthContext";
import { AuthContextProvider } from "@/providers/AuthContextProvider";
import { ThemeModeProvider, useThemeMode } from "@/providers/ThemeModeProvider";
import { Stack, useRouter } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { IconButton, PaperProvider, Text, useTheme } from "react-native-paper";

function RootStack() {
  const router = useRouter();
  const theme = useTheme();
  const { isAuthenticated } = useAuthContext();

  return (
    <Stack>
      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="(settings)"
          options={{ headerShown: false }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen
          name="sign-in"
          options={{
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTitleAlign: "center",
            headerTitle: () => (
              <Text variant="headlineMedium">Logowanie</Text>
            ),
          }}
        />

        <Stack.Screen
          name="sign-up"
          options={{
            title: "Rejestracja",
            headerTitleAlign: "center",
            headerStyle: {
              backgroundColor: theme.colors.background,
            },
            headerTitle: () => (
              <Text
                variant="headlineMedium"
                style={{ textAlign: "center" }}
              >
                Rejestracja
              </Text>
            ),
            headerLeft: () => (
              <IconButton
                mode="contained"
                icon="arrow-left"
                style={{ borderRadius: theme.roundness }}
                onPress={() => router.back()}
              />
            ),
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}

function ThemedAppShell() {
  const { theme, isHydrated } = useThemeMode();

  if (!isHydrated) {
    return <GestureHandlerRootView style={{ flex: 1 }} />;
  }

  return (
    <PaperProvider theme={theme}>
      <AuthContextProvider>
        <RootStack />
      </AuthContextProvider>
    </PaperProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeModeProvider>
        <ThemedAppShell />
      </ThemeModeProvider>
    </GestureHandlerRootView>
  );
}
