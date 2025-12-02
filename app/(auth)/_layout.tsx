import wssOrigin from "@/constants/wss-origin";
import { useAuthContext } from "@/hooks/useAuthContext";
import { WebSocketProvider } from "@/providers/WebSocketProvider";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { useTheme, Text, IconButton } from "react-native-paper";


function AuthStack() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <Stack>
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
    </Stack>
  );
}


export default function AuthLayout() {
  const [key, setKey] = useState(0);

  return (
    <AuthStack />
  );


}


