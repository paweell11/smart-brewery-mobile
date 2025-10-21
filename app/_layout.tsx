import { useAuthContext } from "@/hooks/useAuthContext";
import { AuthContextProvider } from "@/providers/AuthContextProvider";
import { Stack, useRouter } from "expo-router";
import { useColorScheme } from "react-native";
import { MD3DarkTheme as DarkTheme, IconButton, MD3LightTheme as LightTheme, PaperProvider, Text, useTheme } from "react-native-paper";
import { darkThemeColors } from "../constants/darkThemeColors";
import { lightThemeColors } from "../constants/lightThemeColors";


function RootStack() {
  const router = useRouter();
  const theme = useTheme();
  const { isAuthenticated } = useAuthContext();

  return (
    <Stack>
      <Stack.Protected guard={isAuthenticated} >
        <Stack.Screen name="(tabs)" 
        options={{ headerShown: false }}
        />
      </Stack.Protected>

      <Stack.Protected guard={!isAuthenticated} >
        <Stack.Screen 
          name="sign-in" 
          options={{
            headerStyle: {
              backgroundColor: theme.colors.background
            },
            headerTitleAlign: "center",
            headerTitle: props => <Text variant="headlineMedium">Logowanie</Text>,
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
            headerTitle: props => <Text variant="headlineMedium" style={{textAlign: "center"}}>Rejestracja</Text>,
            headerLeft: props => 
              <IconButton 
                mode="contained" 
                icon="arrow-left" 
                style={{borderRadius: theme.roundness}}
                onPress={() => router.back()}
              />,
          }}
        />
      </Stack.Protected>
    </Stack>
  );
}


export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const theme = colorScheme === "light" ? 
    {...LightTheme, roundness: 2, colors: lightThemeColors.colors} : 
    {...DarkTheme, roundness: 2, colors: darkThemeColors.colors};
  
  return (
    <PaperProvider theme={theme}>
      <AuthContextProvider>
        <RootStack />
      </AuthContextProvider>
    </PaperProvider>
  );
}
