import { useStorage } from "@/hooks/useStorage";
import { createContext, ReactNode, useState } from "react";

export const AuthContext = createContext<
  {
    logIn: (accessToken: string | null) => void;
    logOut: () => void;
    accessToken: string | null;
    isLoading: boolean;
    isAuthenticated: boolean;
  } | null
>(null);


export function AuthContextProvider({ children }: { children: ReactNode }) {
  const { storageState, setStorageValue } = useStorage("accessToken");

  return (
    <AuthContext.Provider 
      value={{
        logIn: (accessToken) => {
          setStorageValue(accessToken);
        },
        logOut: () => {
          setStorageValue(null);
        },
        accessToken: storageState.value,
        isLoading: storageState.isLoading,
        isAuthenticated: (storageState.value === null) ? false : true,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}