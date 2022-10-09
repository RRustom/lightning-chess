import { useState } from 'react';
import useGame from '../context/game';
import useAuth from '../context/auth';
import ConnectForm from '../components/ConnectForm';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

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
      <Typography variant="h6" sx={{ marginBottom: '8px' }}>
        {opponent.userName} has invited you to join a game
      </Typography>
      <Button variant="contained" onClick={onClick}>
        Join Game
      </Button>
      <ConnectForm isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </div>
  );
};

export default JoinPage;
