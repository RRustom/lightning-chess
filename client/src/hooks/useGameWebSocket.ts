import { useEffect, useState } from 'react';

const SOCKET_SERVER_URL = 'localhost:8080/ws/game';

const useGameWebSocket = (gameUuid: string | undefined) => {
  const [conn, setConn] = useState<WebSocket | null>(null);

  useEffect(() => {
    if (gameUuid) {
      const socket = new WebSocket(
        'ws://' + SOCKET_SERVER_URL + '/' + gameUuid,
      );
      setConn(socket);

      console.log('Attempting WS Connection...');

      socket.onopen = () => {
        console.log('Successfully Connected');
      };

      socket.onerror = (error) => {
        console.log('Socket Error: ', error);
      };

      socket.onclose = (event) => {
        console.log('Socket Closed Connection: ', event);
      };

      return () => {
        socket && socket.close();
      };
    }
  }, [gameUuid]);

  return { socket: conn };
};

export default useGameWebSocket;
