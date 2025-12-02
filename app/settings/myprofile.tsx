import { HttpError } from "@/api/HttpError";
import ErrorDialog from "@/components/ErrorDialog";
import UserForm from "@/components/forms/UserForm";
import LoadingDialog from "@/components/LoadingDialog";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useUserInfo } from "@/hooks/useUserInfo";
import { useHeaderHeight } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import * as React from "react";
import { useRef } from "react";
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from "react-native";
import { Avatar, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyProfileScreen() {
  const router = useRouter();
  const { logOut } = useAuthContext();
  const theme = useTheme();
  const headerHeight = useHeaderHeight();
  const {current: frHeaderHeight} = useRef(headerHeight); // frist render header height
  const { data, isSuccess, isPending, isError, error } = useUserInfo();

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
      {
        (isPending) && 
        <LoadingDialog title="Pobieranie..." icon="progress-download" />
      }

      {
        (isError) && 
        <ErrorDialog 
          messages={[error.message]}
          btnText="Zamknij"
          onClose={() => {
            if (error instanceof HttpError && error.status === 401) {
              logOut();
            } else {
              router.back();
            }
          }}
        />
      }

      {
        (isSuccess) &&
        <>
          <Avatar.Text
            style={{
              marginTop: 0,
              marginLeft: "auto",
              marginRight: "auto"
            }}
            size={100}
            label={data.firstName[0] + data.lastName[0]}
          />

          <Text variant="titleMedium" style={{paddingTop: 30, paddingBottom: 10, textAlign: "center"}}>
            Edytuj swoje dane osobowe, e-mail oraz hasło.
          </Text>

          <KeyboardAvoidingView behavior="height" keyboardVerticalOffset={frHeaderHeight + 5}>
            <ScrollView>
              <View>
                <UserForm />
              </View>
            </ScrollView>
          </KeyboardAvoidingView>        
        </>
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
