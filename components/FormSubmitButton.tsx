import { useFormContext } from "@/hooks/form-context";
import { Animated, RegisteredStyle, ViewStyle } from "react-native";
import { Button, useTheme } from "react-native-paper";

type FormSubmitButtonProps = {
  style?: false | "" | RegisteredStyle<ViewStyle> | Animated.Value | Animated.AnimatedInterpolation<string | number> | Animated.WithAnimatedObject<ViewStyle> | null | undefined
}

export default function FromSubmitButton({ style }: FormSubmitButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => state.canSubmit}>
      {
        (canSubmit) => (
          <Button
            disabled={!canSubmit} 
            mode="outlined" 
            style={style}
            onPress={(e) => form.handleSubmit()}
          >
            Zaloguj się
          </Button>
        )
      }
    </form.Subscribe>

  );
}