import { ActivityIndicator, View } from "react-native";
import { Dialog, Portal, useTheme } from "react-native-paper";



function LoadingDialog() {
  const theme = useTheme();

  return (
    <View>
      <Portal>
        <Dialog visible={true} >
          <Dialog.Icon icon="alert-circle" color={theme.colors.error} />
          <Dialog.Title style={{textAlign: "center"}}>Łączenie...</Dialog.Title>
          <Dialog.Content>
            <ActivityIndicator size={"large"} animating={true} color={theme.colors.primary} />
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
}



export default LoadingDialog;