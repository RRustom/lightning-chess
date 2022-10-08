import React, {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
} from 'react';
import AuthAPI from '../api/auth';
import { Color } from '../global';

export type AuthContextType = {
  userName: string | null;
  userId: number;
  nodeId: string;
  picture: number;
  connectToNode: (host: string, cert: string, macaroon: string) => void;
  startGame: () => void;
  currentColor: Color;
};

const AuthContextDefaults = {
  userName: null,
  userId: 0,
  nodeId: '',
  picture: 0,
  connectToNode: () => null,
  startGame: () => null,
  currentColor: Color.Black,
};

export const AuthContext = createContext<AuthContextType>(AuthContextDefaults);

export const AuthProvider = ({ children }: any) => {
  const [userName, setUserName] = useState<string | null>(null);
  const [userId, setUserId] = useState<number>(0);
  const [picture, setPicture] = useState<number>(0);
  const [currentColor, setCurrentColor] = useState<Color>(Color.Black);
  const [nodeId, setNodeId] = useState('');

  useEffect(() => {
    const __authenticate = async () => {
      try {
        const response = await AuthAPI.authenticate();
        console.log('RESPONSE: ', response.data);
        if (response.data) {
          if (response.data.nodeId) setNodeId(response.data.nodeId);
          if (response.data.user.userName)
            setUserName(response.data.user.userName);
          if (response.data.user.id) setUserId(response.data.user.id);
          if (response.data.user.picture)
            setPicture(response.data.user.picture);
        }
      } catch (err) {
        console.log(err);
      }
    };

    __authenticate();
  }, []);

  const connectToNode = async (
    host: string,
    cert: string,
    macaroon: string,
  ) => {
    try {
      // if (!gameUuid) return;
      const response = await AuthAPI.connectNode(host, cert, macaroon);
      console.log('RESPONSE: ', response);
      if (response.data) {
        setNodeId(response.data.nodeId);
        setUserName(response.data.user.userName);
        setUserId(response.data.user.id);
        setPicture(response.data.user.picture);

        // seed the jazzicon
        // setPicture(Math.round(Math.random() * 10000000));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const startGame = () => {
    setCurrentColor(Color.White);
  };

  const memoedValue = useMemo(
    () => ({
      userName,
      userId,
      nodeId,
      picture,
      connectToNode,
      startGame,
      currentColor,
    }),
    [userName, userId, nodeId, picture, connectToNode, startGame, currentColor],
  );

  return (
    <AuthContext.Provider value={memoedValue}>{children}</AuthContext.Provider>
  );
};

export default function useAuth() {
  return useContext(AuthContext);
}
