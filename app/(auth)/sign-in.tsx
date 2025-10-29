import ErrorDialog from "@/components/ErrorDialog";
import LoadingDialog from "@/components/LoadingDialog";
import SignInForm from "@/components/SignInForm";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useHeaderHeight } from "@react-navigation/elements";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useRef, useState } from "react";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorType } from "../../types";


export default function SignIn() {
  const { isAuthenticated } = useAuthContext();
  const { ws, connectionStates, connect } = useWebSocket();
  const [error, setError] = useState<ErrorType>({ isError: false });
  
  const headerHeight = useHeaderHeight();
  const { current: frHeaderHeight } = useRef(headerHeight); // first render header height
  const theme = useTheme();
  const router = useRouter();



  if (connectionStates.isClosed && !isAuthenticated && !error.isError) {
    setError({ isError: true, type: "connection", message: "Utracono połączenie"});
  }

  if (ws) {
    ws.onerror = (ev) => {
      setError({ isError: true, type: "basic", message: `Niezidentyfikowany błąd ${ev}`});
    }
  }

  console.log(connectionStates.isConnecting)
  
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
          source={require("@/assets/images/brewery-logo.png")}
        />      
      </View>
    
      <Text variant="titleMedium" style={{paddingTop: 10, paddingBottom: 10, textAlign: "center"}}>
        Zaloguj się za pomocą swojego adresu e-mail.
      </Text>

      <KeyboardAvoidingView behavior="height" keyboardVerticalOffset={frHeaderHeight + 5}>
        <ScrollView>
          <View>
            <SignInForm setError={(e: ErrorType) => setError(e)}/>
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

      {
        (error.isError && error.type === "basic") &&
        <ErrorDialog 
          message={error.message}
          btnText={"Zamknij"}
          onClose={() => setError({ isError: false })}
        />
      }

      {
        (error.isError && error.type === "connection") &&
        <ErrorDialog 
          message={error.message}
          btnText={"Połącz"}
          onClose={() => {
            setError({ isError: false });
            connect();
          }}
        />
      }

      {
        (connectionStates.isConnecting) &&
        <LoadingDialog />
      }
      

    </SafeAreaView>
  );
}