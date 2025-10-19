import SignUpForm from "@/components/SignUpForm";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";


export default function SignUp() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      style={{
        paddingTop: 30,
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
            width: 100,
            height: 100,
            marginTop: 0,
            marginLeft: "auto",
            marginRight: "auto",
            tintColor: theme.colors.primary
          }}
          source={require("../assets/images/user-add.svg")}
        />      
      </View>
    
      <Text variant="titleMedium" style={{paddingTop: 10, paddingBottom: 10, textAlign: "center"}}>
        Zarejsetruj się używając swojego imienia, nazwiska, adresu e-mail oraz tworząc hasło. Hasło musi zawierać co najmniej 5 znaków.
      </Text>

      <KeyboardAvoidingView behavior="height" keyboardVerticalOffset={92.33333206176758}>
        <ScrollView>
          <View>
            <SignUpForm />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

    </SafeAreaView>

  );
}