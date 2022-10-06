import { connect } from 'http2';
import { useEffect, useRef, useState } from 'react';
import socketIOClient from 'socket.io-client';
import useAuth from '../context/auth';

const NEW_CHAT_MESSAGE_EVENT = 'newChatMessage'; // Name of the event
const SOCKET_SERVER_URL = 'localhost:8080/ws/move/game';

const useGameWebSocket = (gameUuid: string | undefined) => {
  const { userId, currentColor } = useAuth();
  // const [moves, setMoves] = useState([]); // Sent and received messages
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

      //   socket.onmessage = function (evt) {
      //     onReceiveMessage(evt)

      //     // setValidMoves(response.data.moves.map((x: string) => parseUCI(x)))
      //     // let messages = evt.data.split('\n');
      //     // for (let i = 0; i < messages.length; i++) {
      //     //     let item = document.createElement("div");
      //     //     item.innerText = messages[i];
      //     //     setMessages(item);
      //     // }
      //     // updateTurn(moves.length)
      //  }
      return () => {
        socket && socket.close();
      };
    }
  }, [gameUuid]);

  // useEffect(() => {

  //   // Creates a WebSocket connection
  //   socketRef.current = socketIOClient(SOCKET_SERVER_URL, {
  //     query: { roomId },
  //   });

  //   // Listens for incoming messages
  //   socketRef.current.on(NEW_CHAT_MESSAGE_EVENT, (message) => {
  //     const incomingMessage = {
  //       ...message,
  //       ownedByCurrentUser: message.senderId === socketRef.current.id,
  //     };
  //     setMessages((messages) => [...messages, incomingMessage]);
  //   });

  //   // Destroys the socket reference
  //   // when the connection is closed
  //   return () => {
  //     socketRef.current.disconnect();
  //   };
  // }, [roomId]);

  // Sends a message to the server that
  // forwards it to all users in the same room
  // const sendMessage = (messageBody) => {
  //   socketRef.current.emit(NEW_CHAT_MESSAGE_EVENT, {
  //     body: messageBody,
  //     senderId: socketRef.current.id,
  //   });
  // };

  return { socket: conn };
};

export default useGameWebSocket;
