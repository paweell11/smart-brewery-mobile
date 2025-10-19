import SignInForm from "@/components/SignInForm";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";


export default function SignIn() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      style={{
        paddingTop: 10,
        paddingLeft: 20,
        paddingRight: 20,
        backgroundColor: theme.colors.background,
        width: "auto",
        height: "100%"
      }}
    >
      <View>
        <Image 
          style={{
            width: 200,
            height: 200,
            marginTop: 0,
            marginLeft: "auto",
            marginRight: "auto"
          }}
          source={require("../assets/images/brewery-logo.png")}
        />      
      </View>
    
      <Text variant="titleMedium" style={{paddingTop: 10, paddingBottom: 10, textAlign: "center"}}>
        Zaloguj się za pomocą swojego adresu e-mail.
      </Text>

      <KeyboardAvoidingView behavior="height" keyboardVerticalOffset={92.33333206176758}>
        <ScrollView>
          <View>
            <SignInForm />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      <View style={{marginTop: 50}}>
        <Text variant="titleMedium" style={{marginBottom: 5, textAlign: "center"}}>
          Nie masz jeszcze konta?
        </Text>

        <Button
          mode="outlined"
          style={{
            marginBottom: 100
          }}
          onPress={() => router.navigate("/sign-up")}
        >
          Zarejstruj się
        </Button>
      </View>

    </SafeAreaView>

  );
}