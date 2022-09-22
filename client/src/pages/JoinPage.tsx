import React from 'react';
import useGame from '../context/game';

type Props = {
  onAccept: () => void;
};

const JoinPage = (props: Props) => {
  const { sendJoinGame, opponent } = useGame();

  const onClick = () => {
    sendJoinGame();
    props.onAccept();
  };

  // If player is BLACK, then join the game invite
  //   useEffect(() => {
  //     if (currentColor === Color.Black) sendJoinGame();
  //   }, []);

  console.log('GAME BY OPPONENT: ', opponent);
  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'center',
      }}
    >
      <div>{opponent.username} has invited you to join a game</div>
      <button onClick={onClick}>Join Game</button>
    </div>
  );
};

export default JoinPage;
