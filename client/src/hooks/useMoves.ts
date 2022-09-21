import { connect } from "http2";
import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";
import useAuth, {Color} from '../context/auth';

const NEW_CHAT_MESSAGE_EVENT = "newChatMessage"; // Name of the event
const SOCKET_SERVER_URL = "localhost:8080/ws/move/game";

const useMoves = (gameUuid:string|undefined) => {
  const { userId, currentColor } = useAuth();
  const [moves, setMoves] = useState([]); // Sent and received messages
  const [conn, setConn] = useState<WebSocket|null>(null)
  const [isMyTurn, setIsMyTurn] = useState(false);
  const socketRef = useRef();

  const updateTurn = (turns: number) => {
    if (currentColor === Color.White) setIsMyTurn(turns % 2 == 0)
    if (currentColor === Color.Black) setIsMyTurn(turns % 2 == 1)
  }

  useEffect(() => {
    if (currentColor === Color.Black) sendJoinGame()
  }, [])

  useEffect(() => {
    updateTurn(moves.length)
  }, [moves])

  useEffect(() => {
    const socket = new WebSocket("ws://" + SOCKET_SERVER_URL + "/" + gameUuid)
    setConn(socket)

    console.log('Attempting WS Connection...');

    socket.onopen = () => {
        console.log('Successfully Connected');
      };

      socket.onerror = (error) => {
        console.log('Socket Error: ', error);
      };
      
      socket.onmessage = function (evt) {
        console.log('RECEIVED WS DATA: ', evt.data)
        // let messages = evt.data.split('\n');
        // for (let i = 0; i < messages.length; i++) {
        //     let item = document.createElement("div");
        //     item.innerText = messages[i];
        //     setMessages(item);
        // }
        // updateTurn(moves.length)
     }
    
    return () => {
      socket && socket.close()
    }

  }, [gameUuid])

  const sendMove = (move: string) => {
      if (!conn) return;
      conn.send(JSON.stringify({
        name: 'new_move',
        moveData: {
          playerId: userId,
          move,
          gameUuid
        }
      }));
  }

  const sendJoinGame = () => {
      if (!conn) return;
      conn.send(JSON.stringify({
        name: 'opponent_join',
        joinGameData: {
          blackId: userId,
          gameUuid
        }
      }));
  }
  


  

  

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

  return { moves, sendMove, isMyTurn };
};

export default useMoves;