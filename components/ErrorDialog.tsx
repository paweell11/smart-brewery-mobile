import { View } from "react-native";
import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";

type ErrorDialogProps = {
  messages: (string | undefined)[] | undefined;
  btnText: string;
  onClose: () => void
}

function formatMessage(messages: (string | undefined)[] | undefined) {
  let fullMessage = "";
  if (messages) {
    messages.forEach((msg) => {
      fullMessage += (msg) ? `${msg}. ` : "";
    });
  }

  return fullMessage;
}

function ErrorDialog({ messages, btnText, onClose }: ErrorDialogProps) {
  const theme = useTheme();

  return (
    <View>
      <Portal>
        <Dialog visible={true} >
          <Dialog.Icon icon="alert-circle" color={theme.colors.error} />
          <Dialog.Title style={{textAlign: "center"}}>Wystąpił błąd</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyLarge">{ formatMessage(messages) }</Text>
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