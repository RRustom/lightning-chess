import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AuthAPI from '../api/auth';
import useAuth from '../context/auth';
import CircularProgress from '@mui/material/CircularProgress';
import useGame from '../context/game';
import usePayment from '../context/payment';
import InviteButton from './InviteButton';

import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

type Props = {
  isOpen: boolean;
};

const InvoiceModal = (props: Props) => {
  const { gameUuid, opponent } = useGame();
  const { paymentRequest, amount, isPaymentSuccess } = usePayment();

  const inviteOpponent = (
    <>
      <DialogTitle>Challenge your friend</DialogTitle>
      <DialogContent>
        <Typography sx={{ marginBottom: '24px' }}>
          You will be playing White ♚. To invite someone to play, send them this
          URL:
        </Typography>
        <InviteButton />
        <Typography sx={{ marginTop: '24px' }}>
          The first person to open this URL will play as Black ♔...
        </Typography>
      </DialogContent>
    </>
  );

  const waitingForPlayer = (
    <>
      <DialogTitle>Pay to play</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {`${opponent.userName} has accepted your invitation!`}
        </DialogContentText>
        <Typography id="paymentRequest" gutterBottom>
          {`Pay ${amount} sats to play against ${opponent.userName}`}
        </Typography>
        <TextField
          sx={{ width: '100%', marginBottom: '8px' }}
          id="paymentRequest"
          variant="outlined"
          multiline
          rows={5}
          defaultValue={paymentRequest}
          autoComplete="off"
          InputProps={{
            readOnly: true,
          }}
        />
        <DialogContentText>Waiting for payment...</DialogContentText>
        <CircularProgress />
      </DialogContent>
    </>
  );

  const waitingForOpponent = (
    <>
      <DialogTitle>Pay to play</DialogTitle>
      <DialogContent>
        <DialogContentText>Waiting for opponent to pay...</DialogContentText>
        <CircularProgress />
      </DialogContent>
    </>
  );

  return (
    <Dialog open={props.isOpen} keepMounted>
      {isPaymentSuccess
        ? waitingForOpponent
        : opponent && opponent.id
        ? waitingForPlayer
        : inviteOpponent}
    </Dialog>
  );
};

export default InvoiceModal;
