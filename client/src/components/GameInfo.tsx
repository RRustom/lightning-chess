import React, { useEffect, useState } from 'react';
import { useTimer } from 'react-timer-hook';
import { Color, Move, Outcome } from '../global';
import useAuth from '../context/auth';
import useGame from '../context/game';
import Jazzicon from 'react-jazzicon';
import Typography from '@mui/material/Typography';
import usePayment from '../context/payment';

type Props = {};

const GameInfo = (props: Props) => {
  const { userId, currentColor, userName, picture } = useAuth();
  const {
    gameUuid,
    validMoves,
    opponent,
    sendMove,
    currentFEN,
    isMyTurn,
    outcome,
  } = useGame();
  const { canStartGame } = usePayment();
  const [whiteUserName, setWhiteUserName] = useState<string | null>(null);
  const [whitePicture, setWhitePicture] = useState<number | null>(null);
  const [blackUserName, setBlackUserName] = useState<string | null>(null);
  const [blackPicture, setBlackPicture] = useState<number | null>(null);

  useEffect(() => {
    if (currentColor == Color.White) {
      setWhiteUserName(userName);
      setWhitePicture(picture);
      setBlackUserName(opponent.userName);
      setBlackPicture(opponent.picture);
    } else {
      setWhiteUserName(opponent.userName);
      setWhitePicture(opponent.picture);
      setBlackUserName(userName);
      setBlackPicture(picture);
    }
  }, [userName, picture, opponent.userName, opponent.picture]);

  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'center',
        width: 744,
        marginTop: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexFlow: 'row nowrap',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <PlayerCard
          userName={whiteUserName}
          picture={whitePicture}
          color={Color.White}
        />
        {/* <div>{`Outcome: ${getOutcomeMessage(outcome, currentColor)}`}</div> */}
        <div>
          {opponent.id ? (
            <PlayerCard
              userName={blackUserName}
              picture={blackPicture}
              color={Color.Black}
            />
          ) : (
            NO_OPPONENT
          )}
        </div>
      </div>
      <div style={{ height: 24 }}>
        {opponent.id && canStartGame ? (
          isMyTurn ? (
            <div>It's your turn!</div>
          ) : (
            <div>Waiting for opponent...</div>
          )
        ) : null}
      </div>
    </div>
  );
};

const PlayerCard = ({ userName, picture, color }: any) => {
  const king = color == Color.White ? '♚' : '♔';
  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'row nowrap',
        alignItems: 'center',
        flex: 1,
      }}
    >
      <Jazzicon diameter={24} seed={picture} />
      <Typography variant="h6" component="div" sx={{ marginLeft: '8px' }}>
        {userName}
      </Typography>
      <div style={{ marginLeft: '8px', fontSize: 28, marginTop: -4 }}>
        {king}
      </div>
    </div>
  );
};

const getOutcomeMessage = (
  outcome: string | null,
  color: Color,
): string | null => {
  if (outcome === Outcome.WhiteWon) {
    return color === Color.White
      ? 'Congrats, you won!'
      : 'White won, tough luck!';
  } else if (outcome === Outcome.BlackWon) {
    return color === Color.White
      ? 'Black won, tough luck!'
      : 'Congrats, you won!';
  } else {
    return outcome;
  }
};

const NO_OPPONENT = 'Waiting for opponent...';

export default GameInfo;
