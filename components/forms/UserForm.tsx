import { makeRequest } from "@/api/makeRequest";
import { useAppForm } from "@/hooks/form";
import { useAuthContext } from "@/hooks/useAuthContext";
import { ErrorType } from "@/types";
import { useEffect } from "react";
import { View } from "react-native";
import { IconButton } from "react-native-paper";
import FromSubmitButton from "../FormSubmitButton";


export default function UserForm({ setError }: { setError: (e: ErrorType) => void}) {
  const { setIsAuthenticated, setUserData, userData } = useAuthContext();
  const { id, firstName="Michał", lastName="Lekstan", email="xdddd@d.pl" } = userData;
  
  const form = useAppForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: ""
    },
    onSubmit: async ({ value }) => {
      try {
        const result = await makeRequest(`/api/auth/edit/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(value)
        });

        const { user } = result;
        const { newId, newFirstName, newLastName, newEmail } = user;

        setIsAuthenticated(true);
        setUserData({
          id: newId,
          firstName: newFirstName,
          lastName: newLastName,
          email: newEmail,
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

  useEffect(() => {
    form.setFieldValue("firstName", firstName);
    form.setFieldValue("lastName", lastName);
    form.setFieldValue("email", email);
  }, [userData]);

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
              <View style={{ display: "flex", flexDirection: "row", alignItems: "center"}}>
                <View style={{ flex: 1 }}>
                  <field.FormTextField label="Imię" />
                </View>
                <IconButton
                  icon="backup-restore"
                  size={26}
                  onPress={() => field.setValue(firstName)}
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
                  onPress={() => field.setValue(lastName)}
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
                  <field.FormTextField label="E-mail" />
                </View>
                <IconButton
                  icon="backup-restore"
                  size={26}
                  onPress={() => field.setValue(email)}
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
  );

}