import { apiClient } from "@/api/apiClientInstance";
import { useAppForm } from "@/hooks/form";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useUserInfo } from "@/hooks/useUserInfo";
import { formOptions } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { View } from "react-native";
import { IconButton } from "react-native-paper";
import FromSubmitButton from "../FormSubmitButton";


const userFormOpts = formOptions({
  defaultValues: {
    firstName: "",
    lastName: "",
    email: "",
    password: ""
  }
});


export default function UserForm() {
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
                    <field.FormTextField label="E-mail" keyboardType="email-address" />
                  </View>
                  <IconButton
                    icon="backup-restore"
                    size={26}
                    onPress={() => field.setValue(data.email)}
                  />
                </View>
              )
            }
          </form.AppField>

          <form.AppField
            name="password"
            validators={{
              onChange: ({value}) => {
                if (value.length > 0 && value.length < 5) {
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

          <FromSubmitButton text={"Zapisz"}/>

        </View>
      </form.AppForm>
    </>
  );
}