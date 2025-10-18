import SignInForm from "@/components/SignInForm";
import { Image } from "expo-image";
import { View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";


export default function SignIn() {
  const theme = useTheme();

  return(
    <SafeAreaView 
      style={{
        paddingLeft: 20,
        paddingRight: 20,
        backgroundColor: theme.colors.background,
        width: "100%",
        height: "100%"
      }}
    >
      <Text variant="headlineMedium" style={{textAlign: "center"}}>
        Logowanie
      </Text>

      <View>
        <Image 
          style={{
            width: 300,
            height: 300,
            marginLeft: "auto",
            marginRight: "auto"
          }}
          source={require("../assets/images/brewery-logo.png")}
        />      
      </View>
    
      <Text variant="titleMedium" style={{paddingTop: 20, paddingBottom: 20, textAlign: "center"}}>
        Zaloguj się za pomocą swojego adresu e-mail
      </Text>

      <View>
        <SignInForm />
      </View>
      
      
      <Text variant="titleMedium" style={{marginTop: 40, marginBottom: 5, textAlign: "center"}}>
        Nie masz jeszcze konta?
      </Text>

      <Button
        mode="outlined"
        style={{
          marginBottom: 10
        }}
      >
        Zarejstruj się
      </Button>
    </SafeAreaView>



  );
}