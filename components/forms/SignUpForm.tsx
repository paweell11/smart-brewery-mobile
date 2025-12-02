import { apiClient } from "@/api/apiClientInstance";
import { Login, UserInfo } from "@/api/types";
import { useAppForm } from "@/hooks/form";
import { useAuthContext } from "@/hooks/useAuthContext";
import { formOptions } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { View } from "react-native";
import ErrorDialog from "../ErrorDialog";
import FromSubmitButton from "../FormSubmitButton";
import LoadingDialog from "../LoadingDialog";


const signUpFormOpts = formOptions({
  defaultValues: {
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  }
});


export default function SignUpForm() {
  const { logIn, accessToken: token } = useAuthContext();

  const registerMutation = useMutation({
    mutationFn: (value: any) => {
      return apiClient.makeRequest<UserInfo>("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: value
      });
    },
  });

  const loginMutation = useMutation({
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
    ...signUpFormOpts,
    onSubmit: async ({ value }) => {
      const { firstName, lastName, email, password } = value;
      const registerValue = {
        email,
        username: email,
        password,
        full_name: firstName + " " + lastName
      };
      const loginValue = {
        username: email,
        password
      };

      try {
        await registerMutation.mutateAsync(registerValue);
        const { access_token: accessToken } = await loginMutation.mutateAsync(loginValue);
        logIn(accessToken);
      } catch (error) {
        if (error instanceof Error)
          console.error("Registration and login error", error.message);
      }
    }
  });

  console.log("AccessToken:", token);

  return (
    <>
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
                <field.FormTextField label="E-mail" keyboardType="email-address" />
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

      {
        (registerMutation.isPending || loginMutation.isPending) &&
        <LoadingDialog title="Wysyłanie..." icon="progress-upload" />
      }

      {
        (registerMutation.isError || loginMutation.isError) &&
        <ErrorDialog 
          messages={
            [registerMutation.error?.message, loginMutation.error?.message]
          }
          btnText="Zamknij"
          onClose={() => {
            if (registerMutation.isError) {
              registerMutation.reset();
            }
            if (loginMutation.isError) {
              loginMutation.reset();
            }
          }}
        />
      }
    </>
  );

}