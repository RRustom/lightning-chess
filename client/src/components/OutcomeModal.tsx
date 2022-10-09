import { forwardRef, ReactElement, Ref } from 'react';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useAuth from '../context/auth';
import useGame from '../context/game';
import usePayment from '../context/payment';
import useWalletBalance from '../hooks/useWalletBalance';
import Chip from '@mui/material/Chip';
import { Color, Outcome } from '../global';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';

type Props = {
  isOpen: boolean;
};

const OutcomeModal = (props: Props) => {
  const { currentColor } = useAuth();
  const { opponent, outcome } = useGame();
  const { walletBalance } = useWalletBalance();
  const { amount } = usePayment();
  const navigate = useNavigate();

  const lostGame = (
    <>
      <DialogTitle>Tough Luck 😵‍💫</DialogTitle>
      <DialogContent>
        <Typography sx={{ marginBottom: '24px' }}>
          {`You lost ${amount} satoshis to ${opponent.userName} with the ${currentColor} pieces`}
        </Typography>
        <Typography sx={{ marginTop: '24px' }}>
          Better luck next time!
        </Typography>
      </DialogContent>
    </>
  );

  const wonGame = (
    <>
      <DialogTitle>You Won ⚡</DialogTitle>
      <DialogContent>
        <Typography sx={{ marginBottom: '24px' }}>
          {`You won ${amount} satoshis by defeating ${opponent.userName} with the ${currentColor} pieces`}
        </Typography>
        <Typography sx={{ marginTop: '24px', marginBottom: '8px' }}>
          Your balance is now:
        </Typography>
        <Chip
          label={`${walletBalance.toLocaleString()} sats`}
          color="warning"
          variant="outlined"
          sx={{ typography: 'h6' }}
        />
      </DialogContent>
    </>
  );

  const didWin =
    (outcome === Outcome.WhiteWon && currentColor === Color.White) ||
    (outcome === Outcome.BlackWon && currentColor === Color.Black);

  return (
    <Dialog open={props.isOpen} TransitionComponent={Transition} fullWidth>
      {didWin ? wonGame : lostGame}
      <DialogActions>
        <Button onClick={() => navigate('/')}>Play Again</Button>
      </DialogActions>
    </Dialog>
  );
};

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement<any, any>;
  },
  ref: Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default OutcomeModal;
