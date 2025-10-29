import ErrorDialog from "@/components/ErrorDialog";
import LoadingDialog from "@/components/LoadingDialog";
import SignUpForm from "@/components/SignUpForm";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useHeaderHeight } from "@react-navigation/elements";
import { Image } from "expo-image";
import { useRef, useState } from "react";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorType } from "../../types";


export default function SignUp() {
  const { isAuthenticated } = useAuthContext();
  const { ws, connectionStates, connect } = useWebSocket();
  const [error, setError] = useState<ErrorType>({ isError: false });
  
  const headerHeight = useHeaderHeight();
  const {current: frHeaderHeight} = useRef(headerHeight); // frist render header height
  const theme = useTheme();



  if (connectionStates.isClosed && !isAuthenticated && !error.isError) {
    setError({ isError: true, type: "connection", message: "Utracono połączenie"});
  }

  if (ws) {
    ws.onerror = (ev) => {
      console.log(ev)
      setError({ isError: true, type: "basic", message: `Niezidentyfikowany błąd ${ev}`});
    }
  }



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
          source={require("@/assets/images/user-add.svg")}
        />      
      </View>
    
      <Text variant="titleMedium" style={{paddingTop: 15, paddingBottom: 15, textAlign: "center"}}>
        Zarejsetruj się używając swojego imienia, nazwiska, adresu e-mail oraz tworząc hasło. Hasło musi zawierać co najmniej 5 znaków.
      </Text>

      <KeyboardAvoidingView behavior="height" keyboardVerticalOffset={frHeaderHeight + 5}>
        <ScrollView>
          <View>
            <SignUpForm setError={(e: ErrorType) => setError(e)} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {
        (error.isError && error.type === "basic") &&
        <ErrorDialog 
          message={error.message}
          btnText="Zamknij"
          onClose={() => setError({ isError: false })}
        />
      }

      {
        (error.isError && error.type === "connection") &&
        <ErrorDialog 
          message={error.message}
          btnText="Połącz"
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