import { useAppForm } from "@/hooks/form";
import { useAuthContext } from "@/hooks/useAuthContext";
import { formOptions } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { View } from "react-native";
import FromSubmitButton from "../FormSubmitButton";
import { apiClient } from "@/api/apiClientInstance";
import { Login } from "@/api/types";
import ErrorDialog from "../ErrorDialog";
import LoadingDialog from "../LoadingDialog";


const signInFormOpts = formOptions({
  defaultValues: {
    "username": "",
    "password": "",
  }
})


export default function SignInForm() {
  const { logIn, accessToken: token } = useAuthContext();
  
  const mutation = useMutation({
    mutationFn: (value: any) => {
      return apiClient.makeRequest<Login>("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: value
      });
    },
  });

  const form = useAppForm({
    ...signInFormOpts,
    onSubmit: async ({ value }) => {
      try {
        const { access_token: accessToken } = await mutation.mutateAsync(value);
        logIn(accessToken);
      } catch (error) {
        if (error instanceof Error)
          console.error("Login error", error.message);
      }
    }
  });

  console.log("AccessToken:", token);

  return (
    <>
      <form.AppForm>
        <View>
          <form.AppField
            name="username"
            validators={{
              onChange: ({value}) => {
                if (!value) {
                  return "Pole nie może być puste."
                }

                if (!value.includes("@")) {
                  return "Niepoprawny adres e-mail.";
                }
              } 
            }}
          >
            {
              (field) => 
                <field.FormTextField
                  label="E-mail"
                  keyboardType="email-address"
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

          <FromSubmitButton text={"Zaloguj się "}/>

        </View>
      </form.AppForm>
      
      {
        (mutation.isPending) && 
        <LoadingDialog title="Wysyłanie..." icon="progress-upload" />
      }

      {
        (mutation.isError) &&
        <ErrorDialog 
          messages={[mutation.error.message]}
          btnText={"Zamknij"}
          onClose={() => mutation.reset()}
        />
      }
    </>
  );
} 