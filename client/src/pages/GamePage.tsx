import React, {useState, useEffect} from 'react';
import '../App.css';
import ChessBoard from '../components/ChessBoard';
import InviteButton from '../components/InviteButton';
import { connect, sendMsg } from "../api/websocket";
import useAuth from '../context/auth'
import GameAPI from '../api/game';

interface ChatHistoryProps{
  chatHistory: Array<MessageEvent>
}

const ChatHistory = ({chatHistory}: ChatHistoryProps) => {
  const messages = chatHistory.map((msg, index) => (
    <p key={index}>{msg.data}</p>
  ))

  return (
    <div>
      {messages}
    </div>
  )
}

function GamePage() {
  const {userName} = useAuth();
  const [chatHistory, setChatHistory] = useState<MessageEvent[]>([])

  useEffect(() => {
    connect(msg => {
      console.log('New Message: ', msg)
      setChatHistory(x => [...x, msg])
    })
  }, [])

  const send = () => {
    console.log("hello");
    sendMsg("hello");
  }

  return (
    <div className="App">
      <div>Welcome, {userName}!</div>
      <InviteButton />
      <ChessBoard />
      <ChatHistory chatHistory={chatHistory} />
      <button onClick={send}>Hit</button>
    </div>
    
  );
}



export default GamePage;
