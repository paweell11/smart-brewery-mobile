import { makeRequest } from "@/api/makeRequest";
import { useAppForm } from "@/hooks/form";
import { useAuthContext } from "@/hooks/useAuthContext";
import { ErrorType } from "@/types";
import { View } from "react-native";
import FromSubmitButton from "../FormSubmitButton";

export default function SignUpForm({ setError }: { setError: (e: ErrorType) => void }) {
  const { setIsAuthenticated, setUserData } = useAuthContext();


  const form = useAppForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: ""
    },
    onSubmit: async ({value}) => {
      try {
        const result = await makeRequest("/api/auth/register", {
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