import { useAppForm } from "@/hooks/form";
import { formOptions } from "@tanstack/react-form";
import { View } from "react-native";
import FromSubmitButton from "./FormSubmitButton";
import { useAuthContext } from "@/hooks/useAuthContext";

const signInFormOpts = formOptions({
  defaultValues: {
    "email": "",
    "password": "",
  }
})


export default function SignInForm() {
  const { setIsAuthenticated } = useAuthContext();

  const form = useAppForm({
    ...signInFormOpts,
    onSubmit: (({value}) => {
      console.log(value);
      setIsAuthenticated(true);
    })
  })

  return (
    <form.AppForm>
      <View>
        <form.AppField
          name="email"
          validators={{
            onChange: ({value}) => {
              if (!value) {
                return "Pole nie może być puste."
              }

              if (!value.includes("@")) {
                return "Niepoprawny adres e-mail."
              }
            } 
          }}
        >
          {
            (field) => 
              <field.FormTextField
                label="Adres e-mail" 
              />
          }
        </form.AppField>

        <form.AppField
          name="password"
          validators={{
            onChange: ({value}) => {
              if (!value) {
                return "Pole nie może być puste."
              }

              if (value.length < 5) {
                return "Hasło zbyt krótkie."
              }
            }
          }}
        >
          {
            (field) => 
              <field.FormTextField 
                label="Hasło"
                togglePasswordBtn={true}
              />
          }
        </form.AppField>

        <FromSubmitButton text={"Zaloguj się"}/>

      </View>
    </form.AppForm>

  );
} 