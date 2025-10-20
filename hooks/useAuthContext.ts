import { AuthContext } from "@/providers/AuthContextProvider";
import { useContext } from "react";


export function useAuthContext() {
  const contextValue = useContext(AuthContext);

  if (contextValue === null) {
    throw new Error("No value provided to AuthContext");
  }

  return contextValue;
}