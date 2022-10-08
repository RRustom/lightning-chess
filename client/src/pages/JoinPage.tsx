import { useState } from 'react';
import useGame from '../context/game';
import useAuth from '../context/auth';
import ConnectForm from '../components/ConnectForm';
import Button from '@mui/material/Button';

type Props = {
  onAccept: () => void;
};

const JoinPage = (props: Props) => {
  const { userName } = useAuth();
  const { sendJoinGame, opponent } = useGame();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  console.log('OPPONENT: ', opponent);

  const onClick = () => {
    if (userName) {
      onAcceptInvitation();
    } else {
      setIsDialogOpen(true);
    }
  };

  const onAcceptInvitation = () => {
    sendJoinGame();
    props.onAccept();
  };

  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
      }}
    >
      <div>{opponent.userName} has invited you to join a game</div>
      <Button variant="contained" onClick={onClick}>
        Join Game
      </Button>
      <ConnectForm isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </div>
  );
};

export default JoinPage;
