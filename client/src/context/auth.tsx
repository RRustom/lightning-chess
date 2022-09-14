import React, {createContext, useContext, useState, useMemo} from 'react';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
// import AuthDataService from 'services/AuthDataService';

export type AuthContextType = {
  userName: string | null,
  signUp: () => void;
}

const AuthContextDefaults = {
  userName: null,
  signUp: () => null
}

export const AuthContext = createContext<AuthContextType>(AuthContextDefaults);

export const AuthProvider = ({children}: any) => {
  const [userName, setUserName] = useState<string|null>(null);

  const signUp = () => {
    if (!userName) {
        setUserName(__generateRandomName())
    }
    return
  }

  const memoedValue = useMemo(() => ({
      userName,
      signUp
    }),
    [
      userName,
      signUp
    ],
  );

  return (
    <AuthContext.Provider  value={memoedValue}>
      {children}
    </AuthContext.Provider>
    )
}

const __generateRandomName = (): string => {
    return uniqueNamesGenerator({dictionaries: [adjectives, colors, animals]});
}

export default function useAuth() {
  return useContext(AuthContext);
}