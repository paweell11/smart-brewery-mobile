import { Redirect, Stack, useRouter } from "expo-router";
import { useColorScheme } from "react-native";
import { MD3DarkTheme as DarkTheme, IconButton, MD3LightTheme as LightTheme, PaperProvider, Text } from "react-native-paper";
import { darkThemeColors } from "./constants/darkThemeColors";
import { lightThemeColors } from "./constants/lightThemeColors";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const theme = colorScheme === "light" ? 
    {...LightTheme, roundness: 2, colors: lightThemeColors.colors} : 
    {...DarkTheme, roundness: 2, colors: darkThemeColors.colors};
  
  return (
    
    <PaperProvider theme={theme}>
      <Redirect href={"/sign-in"}/>
      <Stack>
        <Stack.Protected guard={true} >
          <Stack.Screen name="(tabs)/index"/>
        </Stack.Protected>

        <Stack.Protected guard={true} >
          <Stack.Screen 
            name="sign-in" 
            options={{
              headerStyle: {
                backgroundColor: theme.colors.background
              },
              headerTitle: props => <Text variant="headlineMedium" style={{textAlign: "center"}}>Logowanie</Text>,
            }} 
          />
          <Stack.Screen 
            name="sign-up" 
            options={{
              title: "Rejestracja", 
              headerStyle: {
                backgroundColor: theme.colors.background,
              },
              headerTitle: props => <Text variant="headlineMedium" style={{marginLeft: 44}}>Rejestracja</Text>,
              headerLeft: props => 
                <IconButton 
                  mode="contained" 
                  icon="arrow-left" 
                  style={{borderRadius: theme.roundness}}
                  onPress={() => router.back()}
                />
            }}
          />
        </Stack.Protected>


      </Stack>
    </PaperProvider>
  );
}
