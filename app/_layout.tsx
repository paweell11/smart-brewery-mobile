import { useAuthContext } from "@/hooks/useAuthContext";
import { AuthContextProvider } from "@/providers/AuthContextProvider";
import { ThemeModeProvider, useThemeMode } from "@/providers/ThemeModeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PaperProvider } from "react-native-paper";


function RootStack() {
  const { isAuthenticated } = useAuthContext();

  return (
    <Stack>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen 
          name="(auth)"
          options={{ headerShown: false }}
        />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="settings"
          options={{ headerShown: false }}
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


const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeModeProvider>
        <QueryClientProvider client={queryClient} >
          <ThemedAppShell />
        </QueryClientProvider>
      </ThemeModeProvider>
    </GestureHandlerRootView>
  );
}
