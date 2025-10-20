import { createContext, ReactNode, useState } from "react";


export const AuthContext = createContext<
  {
    isAuthenticated: boolean;
    setIsAuthenticated: (isAuthenticated: boolean) => void;
  } | null
>(null);


export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated: (isAuthenticated) => setIsAuthenticated(isAuthenticated) }}>
      {children}
    </AuthContext.Provider>
  );
}