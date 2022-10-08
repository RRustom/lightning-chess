import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import '../App.css';
import ChessBoard from '../components/ChessBoard';
import InviteButton from '../components/InviteButton';
// import { connect, sendMsg } from '../api/websocket';
import useAuth from '../context/auth';
import GameAPI from '../api/game';
import { GameProvider } from '../context/game';
import { PaymentProvider } from '../context/payment';
import { Color } from '../global';
import JoinPage from './JoinPage';

function GamePage() {
  const { userName, currentColor, nodeId } = useAuth();
  const navigate = useNavigate();
  const { uuid } = useParams();
  const gameUuid = uuid || '';
  const [acceptedInvite, setAcceptedInvite] = useState(false);

  // useEffect(() => {
  //   if (!userName) {
  //     window.localStorage.setItem('gameUuid', gameUuid);
  //     navigate(`/`);
  //   }
  // }, [userName]);

  const showJoinPage = currentColor === Color.Black && !acceptedInvite;

  return (
    <GameProvider>
      <PaymentProvider>
        {showJoinPage ? (
          <JoinPage onAccept={() => setAcceptedInvite(true)} />
        ) : (
          <ChessBoard />
        )}
      </PaymentProvider>
    </GameProvider>
  );
}

export default GamePage;
