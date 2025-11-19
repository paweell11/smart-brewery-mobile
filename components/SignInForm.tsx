import { useAppForm } from "@/hooks/form";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ErrorType } from "@/types";
import { formOptions } from "@tanstack/react-form";
import { View } from "react-native";
import FromSubmitButton from "./FormSubmitButton";
import { makeRequest } from "@/api/makeRequest";


const signInFormOpts = formOptions({
  defaultValues: {
    "email": "",
    "password": "",
  }
})


export default function SignInForm({ setError }: { setError: (e: ErrorType) => void}) {
  const { setIsAuthenticated, setUserData } = useAuthContext();


  const form = useAppForm({
    ...signInFormOpts,
    onSubmit: async ({ value }) => {
      try {
        const result = await makeRequest("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(value)
        });

        const { token, user } = result;
        const { id, firstName, lastName, email } = user;

        setIsAuthenticated(true);
        setUserData({
          id,
          firstName,
          lastName,
          email,
        });
      
      } catch (error) {
        if (error instanceof Error) {
          setError({
            isError: true,
            type: "basic",
            message: error.message,
          });
        }
      }
    }
  });

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