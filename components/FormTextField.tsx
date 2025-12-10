import { useFieldContext } from "@/hooks/form-context";
import { useState } from "react";
import { KeyboardTypeOptions, StyleProp, TextStyle, View } from "react-native";
import { HelperText, TextInput } from "react-native-paper";

type FormTextFieldProps = {
  label: string;
  style?: StyleProp<TextStyle>;
  togglePasswordBtn?: boolean;
  keyboardType?: KeyboardTypeOptions;
  disabled?: boolean;
}

export function FormTextField({ label, style, togglePasswordBtn, keyboardType, disabled }: FormTextFieldProps) {
  const field = useFieldContext();
  const [secure, setSecure] = useState(() => !togglePasswordBtn ? false : true);
  const value = field.state.value as string ?? undefined;

  return (
    <View>
      <TextInput
        mode="outlined"
        keyboardType={keyboardType}
        label={label}
        disabled={!!disabled}
        style={style}
        onChangeText={(text) => {
          field.handleChange(text)
        }}
        error={!field.state.meta.isValid}
        value={value}
        secureTextEntry={secure}
        right={
          togglePasswordBtn && <TextInput.Icon icon={secure ? "eye" : "eye-off"} onPress={() => setSecure((prev) => !prev)}/>
        }
      />
      <HelperText 
        type="error"
        style={{
          paddingTop: 0,
          paddingBottom: 0,
        }}
        children={field.state.meta.errors[0] ?? " "}
      />
    </View>

  );  
}