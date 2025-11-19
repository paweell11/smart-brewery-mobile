import ErrorDialog from "@/components/ErrorDialog";
import UserForm from "@/components/forms/UserForm";
import { useAuthContext } from "@/hooks/useAuthContext";
import { ErrorType } from "@/types";
import { useHeaderHeight } from "@react-navigation/elements";
import * as React from "react";
import { useRef, useState } from "react";
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyProfileScreen() {
  const theme = useTheme();
  const headerHeight = useHeaderHeight();
  const {current: frHeaderHeight} = useRef(headerHeight); // frist render header height

  const [error, setError] = useState<ErrorType>({ isError: false });
  const { userData } = useAuthContext();
  const { firstName = "Michał", lastName = "Lestan", email = "m.l@ml.pl" } = userData;
  const initials = firstName[0].concat(lastName[0]);


  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      style={{
        paddingTop: 20,
        paddingLeft: 20,
        paddingRight: 20,
        backgroundColor: theme.colors.background,
        width: "auto",
        height: "100%"
      }}
    >
      <Avatar.Text
        style={{
          marginTop: 0,
          marginLeft: "auto",
          marginRight: "auto"
        }}
        size={100}
        label={initials}
      />

      <Text variant="titleMedium" style={{paddingTop: 30, paddingBottom: 10, textAlign: "center"}}>
        Edytuj swoje dane osobowe, e-mail oraz hasło.
      </Text>

      <KeyboardAvoidingView behavior="height" keyboardVerticalOffset={frHeaderHeight + 5}>
        <ScrollView>
          <View>
            <UserForm setError={(e: ErrorType) => setError(e)}/>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {
        (error.isError && error.type === "basic") &&
        <ErrorDialog 
          message={error.message}
          btnText={"Zamknij"}
          onClose={() => setError({ isError: false })}
        />
      }

      
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
});
