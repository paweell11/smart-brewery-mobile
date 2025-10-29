import { createContext, ReactNode, useState } from "react";

type UserData = {
  firstName?: string;
  lastName?: string;
  email?: string;
};

export const AuthContext = createContext<
  {
    isAuthenticated: boolean;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
    userData: UserData;
    setUserData: (userData: UserData) => void;
  } | null
>(null);


export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<UserData>({});

  return (
    <AuthContext.Provider 
      value={{
        isAuthenticated, 
        setIsAuthenticated: (isAuthenticated) => setIsAuthenticated(isAuthenticated),
        userData: userData,
        setUserData: (userData) => setUserData(userData),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}