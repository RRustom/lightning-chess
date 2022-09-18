import React, {createContext, useContext, useState, useMemo} from 'react';
import { uniqueNamesGenerator, adjectives, colors, animals } from 'unique-names-generator';
import UserAPI from '../api/user'

export type AuthContextType = {
  userName: string | null,
  userId: number,
  signUp: () => void;
}

const AuthContextDefaults = {
  userName: null,
  userId: 0,
  signUp: () => null
}

export const AuthContext = createContext<AuthContextType>(AuthContextDefaults);

export const AuthProvider = ({children}: any) => {
  const [userName, setUserName] = useState<string|null>(null);
  const [userId, setUserId] = useState<number>(0);

  const signUp = async () => {
    if (!userName) {
        const newUsername = __generateRandomName()
        setUserName(newUsername)

        try {
          const response = await UserAPI.signUp(newUsername);
          setUserId(parseInt(response.data));
        } catch(err) {
          console.log('error while signing up')
        } 
    }
    return
  }

  const memoedValue = useMemo(() => ({
      userName,
      userId,
      signUp
    }),
    [
      userName,
      userId,
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