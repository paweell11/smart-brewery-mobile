import { ActivityIndicator, View } from "react-native";
import { Dialog, Portal, useTheme } from "react-native-paper";
import { IconSource } from "react-native-paper/lib/typescript/components/Icon";

type LoadingDialogProps = {
  title: string;
  icon: IconSource;
}


function LoadingDialog({ title, icon }: LoadingDialogProps) {
  const theme = useTheme();

  return (
    <View>
      <Portal>
        <Dialog visible={true} >
          <Dialog.Icon icon={icon} color={theme.colors.primary} />
          <Dialog.Title style={{textAlign: "center"}}>{ title }</Dialog.Title>
          <Dialog.Content>
            <ActivityIndicator size={"large"} animating={true} color={theme.colors.primary} />
          </Dialog.Content>
        </Dialog>
      </Portal>
    </View>
  );
}



export default LoadingDialog;