import { Redirect, Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { MD3DarkTheme as DarkTheme, MD3LightTheme as LightTheme, PaperProvider } from "react-native-paper";
import { darkThemeColors } from "./constants/darkThemeColors";
import { lightThemeColors } from "./constants/lightThemeColors";

export default function RootLayout() {
  const colorScheme = useColorScheme();
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
          <Stack.Screen name="sign-in" options={{headerShown: false}} />
          <Stack.Screen name="sign-up" />
        </Stack.Protected>


      </Stack>
    </PaperProvider>
  );
}
