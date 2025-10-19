import { useFormContext } from "@/hooks/form-context";
import { Animated, RegisteredStyle, ViewStyle } from "react-native";
import { Button } from "react-native-paper";

type FormSubmitButtonProps = {
  style?: false | "" | RegisteredStyle<ViewStyle> | Animated.Value | Animated.AnimatedInterpolation<string | number> | Animated.WithAnimatedObject<ViewStyle> | null | undefined;
  text: string;
}

export default function FromSubmitButton({ style, text }: FormSubmitButtonProps) {
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
            {text}
          </Button>
        )
      }
    </form.Subscribe>

  );
}