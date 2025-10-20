import { useAppForm } from "@/hooks/form";
import { View } from "react-native";
import FromSubmitButton from "./FormSubmitButton";
import { useAuthContext } from "@/hooks/useAuthContext";


export default function SignUpForm() {
  const { setIsAuthenticated } = useAuthContext();

  const form = useAppForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: ""
    },
    onSubmit: ({value}) => {
      console.log(value);
      setIsAuthenticated(true);
    }
  })

  return (
    <form.AppForm>
      <View>
        <form.AppField
          name={"firstName"}
          validators={{
            onChange: ({value}) => {
              if (!value) {
                return "Pole nie może być puste";
              }
            }
          }}
        >
          {
            (field) => (
              <field.FormTextField label="Imię" />
            )
          }
        </form.AppField>

        <form.AppField
          name={"lastName"}
          validators={{
            onChange: ({value}) => {
              if (!value) {
                return "Pole nie może być puste.";
              }
            }
          }}
        >
          {
            (field) => (
              <field.FormTextField label="Nazwisko" />
            )
          }
        </form.AppField>

        <form.AppField
          name={"email"}
          validators={{
            onChange: ({value}) => {
              if (!value) {
                return "Pole nie może być puste.";
              }

              if (!value.includes("@")) {
                return "Niepoprawny adres e-mail.";
              }
            }
          }}
        >
          {
            (field) => (
              <field.FormTextField label="E-mail" />
            )
          }
        </form.AppField>

        <form.AppField
          name="password"
          validators={{
            onChange: ({value}) => {
              if (!value) {
                return "Pole nie może być puste.";
              }

              if (value.length < 5) {
                return "Hasło zbyt krótkie.";
              }
            }
          }}
        >
          {
            (field) => (
              <field.FormTextField label="Hasło" togglePasswordBtn={true} />
            )
          }
        </form.AppField>

        <FromSubmitButton text={"Zarejestruj się"}/>

      </View>
    </form.AppForm>
  );

}