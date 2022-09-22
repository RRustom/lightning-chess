import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} from 'unique-names-generator';
import AuthAPI from '../api/auth';
import { Color } from '../global';

export type AuthContextType = {
  userName: string | null;
  userId: number;
  signUp: () => void;
  startGame: () => void;
  currentColor: Color;
};

const AuthContextDefaults = {
  userName: null,
  userId: 0,
  signUp: () => null,
  startGame: () => null,
  currentColor: Color.Black,
};

export const AuthContext = createContext<AuthContextType>(AuthContextDefaults);

export const AuthProvider = ({ children }: any) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<number>(0);
  const [currentColor, setCurrentColor] = useState<Color>(Color.Black);

  const signUp = async () => {
    if (!userName) {
      const newUsername = __generateRandomName();
      setUserName(newUsername);

      try {
        const response = await AuthAPI.signUp(newUsername);
        setUserId(parseInt(response.data));
      } catch (err) {
        console.log('error while signing up');
      }
    }
    return;
  };

  const startGame = () => {
    setCurrentColor(Color.White);
  };

  const memoedValue = useMemo(
    () => ({
      userName,
      userId,
      signUp,
      startGame,
      currentColor,
    }),
    [userName, userId, signUp, startGame, currentColor],
  );

  return (
    <AuthContext.Provider value={memoedValue}>{children}</AuthContext.Provider>
  );
};

const __generateRandomName = (): string => {
  return uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals] });
};

export default function useAuth() {
  return useContext(AuthContext);
}
