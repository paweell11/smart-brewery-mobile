import { useAppForm } from "@/hooks/form";
import { useAuthContext } from "@/hooks/useAuthContext";
import { useWebSocket } from "@/hooks/useWebSocket";
import { ErrorType } from "@/types";
import { formOptions } from "@tanstack/react-form";
import { View } from "react-native";
import FromSubmitButton from "./FormSubmitButton";


const signInFormOpts = formOptions({
  defaultValues: {
    "email": "",
    "password": "",
  }
})


export default function SignInForm({ setError }: { setError: (e: ErrorType) => void}) {
  const { setIsAuthenticated, setUserData } = useAuthContext();
  const { ws, connectionStates } = useWebSocket();
  const { isOpen } = connectionStates;


  const form = useAppForm({
    ...signInFormOpts,
    onSubmit: ({ value }) => {
      
      let loginData: Record<string, string> = {...value};
      loginData["type"] = "login";

      if (ws) {
        
        if (isOpen) {
          ws.send(JSON.stringify(loginData));
          console.log("Send:", loginData)
        }

        ws.onmessage = (ev) => {
          console.log("Received:", ev.data);
          
          const { type, firstName, lastName, email, error } = JSON.parse(ev.data);
          if (type === "loginSuccess" && firstName && lastName && email) {
            setIsAuthenticated(true);
            setUserData({ firstName, lastName, email });
            ws.close();
          }

          if (type === "error" && error) {
            setError({ isError: true, type: "basic", message: error});
          }
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