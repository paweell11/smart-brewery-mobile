import { View } from "react-native";
import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";

type ErrorDialogProps = {
  message: string | undefined;
  btnText: string;
  onClose: () => void
}


function ErrorDialog({ message, btnText, onClose }: ErrorDialogProps) {
  const theme = useTheme();

  return (
    <View>
      <Portal>
        <Dialog visible={true} >
          <Dialog.Icon icon="alert-circle" color={theme.colors.error} />
          <Dialog.Title style={{textAlign: "center"}}>Wystąpił błąd</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyLarge">{message}</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button mode="outlined" onPress={() => onClose()}>{btnText}</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}



export default ErrorDialog;