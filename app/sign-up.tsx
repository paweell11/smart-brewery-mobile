import SignUpForm from "@/components/SignUpForm";
import { useHeaderHeight } from "@react-navigation/elements";
import { Image } from "expo-image";
import { useRef } from "react";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";


export default function SignUp() {
  const headerHeight = useHeaderHeight();
  const {current: frHeaderHeight} = useRef(headerHeight); // frist render header height
  const theme = useTheme();

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
            width: 80,
            height: 80,
            marginTop: 0,
            marginLeft: "auto",
            marginRight: "auto",
            tintColor: theme.colors.primary
          }}
          source={require("../assets/images/user-add.svg")}
        />      
      </View>
    
      <Text variant="titleMedium" style={{paddingTop: 15, paddingBottom: 15, textAlign: "center"}}>
        Zarejsetruj się używając swojego imienia, nazwiska, adresu e-mail oraz tworząc hasło. Hasło musi zawierać co najmniej 5 znaków.
      </Text>

      <KeyboardAvoidingView behavior="height" keyboardVerticalOffset={frHeaderHeight + 5}>
        <ScrollView>
          <View>
            <SignUpForm />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    
    </SafeAreaView>
  );
}