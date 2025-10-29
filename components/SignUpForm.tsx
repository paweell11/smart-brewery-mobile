import { useAppForm } from "@/hooks/form";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ErrorType } from "@/types";
import { View } from "react-native";
import FromSubmitButton from "./FormSubmitButton";

export default function SignUpForm({ setError }: { setError: (e: ErrorType) => void }) {
  const { setIsAuthenticated, setUserData } = useAuthContext();
  const { ws, connectionStates } = useWebSocket();
  const { isOpen } = connectionStates;


  const form = useAppForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: ""
    },
    onSubmit: ({value}) => {
      console.log(value);

      let registerData: Record<string, string> = {...value};
      registerData["type"] = "register";

      if (ws) {

        if (isOpen) {
          ws.send(JSON.stringify(registerData));
          console.log("Send:", registerData);
        }

        ws.onmessage = (ev) => {
          console.log("Received:", ev.data);
          
          const { type, firstName, lastName, email, error } = JSON.parse(ev.data);
          if (type === "registerSuccess" && firstName && lastName && email) {
            setIsAuthenticated(true);
            setUserData({ firstName, lastName, email });
            ws.close();
          }

          if (type === "error" && error) {
            setError({ isError: true, message: error });
          }

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