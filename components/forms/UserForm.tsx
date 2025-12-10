import { apiClient } from "@/api/apiClientInstance";
import { useAppForm } from "@/hooks/form";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useUserInfo } from "@/hooks/useUserInfo";
import { formOptions } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { View } from "react-native";
import { IconButton, useTheme } from "react-native-paper";
import ErrorDialog from "../ErrorDialog";
import FromSubmitButton from "../FormSubmitButton";
import LoadingDialog from "../LoadingDialog";


const userFormOpts = formOptions({
  defaultValues: {
    firstName: "",
    lastName: "",
    email: "",
  }
});


export default function UserForm() {
  const theme = useTheme();
  const { accessToken } = useAuthContext();
  const { data } = useUserInfo();

  const mutation = useMutation({
    mutationFn: (value: any) => {
      return apiClient.makeRequest("/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: value
      });
    },
  });
  
  useEffect(() => {
    if (data) {
      form.setFieldValue("firstName", data.firstName);
      form.setFieldValue("lastName", data.lastName);
      form.setFieldValue("email", data.email);
    }
  }, [data]);

  const form = useAppForm({
    ...userFormOpts,
    onSubmit: async ({ value }) => {
      const { firstName, lastName } = value;
      const updateValue = { full_name: firstName + " " + lastName };
      
      try {
        await mutation.mutateAsync(updateValue);
      } catch (error) {
        if (error instanceof Error)
          console.error("Update error", error.message);
      }
    }
  });

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
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center"}}>
                  <View style={{ flex: 1 }}>
                    <field.FormTextField label="Imię" />
                  </View>
                  <IconButton
                    icon="backup-restore"
                    size={26}
                    onPress={() => field.setValue(data.firstName)}
                  />
                </View>
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
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center"}}>
                  <View style={{ flex: 1 }}>
                    <field.FormTextField label="Nazwisko" />
                  </View>
                  <IconButton
                    icon="backup-restore"
                    size={26}
                    onPress={() => field.setValue(data.lastName)}
                  />
                </View>
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
                <View style={{ display: "flex", flexDirection: "row", alignItems: "center"}}>
                  <View style={{ flex: 1 }}>
                    <field.FormTextField label="E-mail" keyboardType="email-address" disabled={true} />
                  </View>
                  <IconButton
                    icon="backup-restore"
                    iconColor={theme.colors.background}
                    size={26}
                    onPress={() => {}}
                  />
                </View>
              )
            }
          </form.AppField>

          <FromSubmitButton text={"Zapisz"}/>

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