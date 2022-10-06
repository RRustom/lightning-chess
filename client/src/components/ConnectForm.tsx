import React, { useCallback, useState } from 'react';
// import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import FormGroup from '@mui/material/FormGroup';
import Button from '@mui/material/Button';
import InputLabel from '@mui/material/InputLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import AuthAPI from '../api/auth';
import { responsiveProperty } from '@mui/material/styles/cssUtils';
// import { observer } from 'mobx-react-lite';
// import { useStore } from '../store/Provider';

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const ConnectForm = (props: Props) => {
  // const store = useStore();
  const navigate = useNavigate();
  const [host, setHost] = useState('');
  const [cert, setCert] = useState('');
  const [macaroon, setMacaroon] = useState('');

  // const handleSubmit = useCallback(
  //   async (e: React.FormEvent<HTMLElement>) => {
  //     e.preventDefault();
  //     store.connectToLnd(host, cert, macaroon);
  //   },
  //   [host, cert, macaroon, store],
  // );
  const handleSubmit = (evt: any) => {
    evt.preventDefault();
    __connectToNode(host, cert, macaroon);
    // handleClose()
  };

  const handleClose = () => {
    setHost('');
    setCert('');
    setMacaroon('');
    props.setIsOpen(false);
  };

  return (
    <Dialog open={props.isOpen} onClose={handleClose}>
      <DialogTitle>Connect to your LND Node</DialogTitle>
      <form onSubmit={handleSubmit} id="connectToLND">
        <DialogContent>
          <Typography id="host" gutterBottom>
            LND Host
          </Typography>
          <TextField
            sx={{ width: '100%', marginBottom: '8px' }}
            id="host"
            variant="outlined"
            value={host}
            autoComplete="off"
            placeholder="127.0.0.1:10001"
            required
            onChange={(e) => setHost(e.target.value)}
          />
          <Typography id="cert" gutterBottom>
            TLS Certificate
          </Typography>
          <TextField
            sx={{ width: '100%', marginBottom: '8px' }}
            id="cert"
            variant="outlined"
            required
            multiline
            rows={8}
            value={cert}
            placeholder="HEX encoded. Ex: 4942416749514259476c4c7a577a6e6f4550564158..."
            onChange={(e) => setCert(e.target.value)}
            autoComplete="off"
          />
          <Typography id="macaroon" gutterBottom>
            Macaroon
          </Typography>
          <TextField
            sx={{ width: '100%', marginBottom: '8px' }}
            id="macaroon"
            variant="outlined"
            required
            multiline
            rows={3}
            value={macaroon}
            placeholder="HEX encoded. Ex: 4942416749514259476c4c7a577a6e6f4550564158..."
            onChange={(e) => setMacaroon(e.target.value)}
            autoComplete="off"
          />
          <DialogContentText>
            Open a Terminal and enter{' '}
            <code>
              lncli bakemacaroon info:read offchain:read invoices:read
              invoices:write message:read message:write
            </code>{' '}
            to bake a macaroon with only limited access to get node info, create
            invoices, and sign/verify messages.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button color="error" onClick={handleClose}>
            Cancel
          </Button>
          <Button color="primary" type="submit">
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const __connectToNode = async (
  host: string,
  cert: string,
  macaroon: string,
) => {
  try {
    // if (!gameUuid) return;
    const response = await AuthAPI.connectNode(host, cert, macaroon);
    console.log('RESPONSE: ', response);
    // console.log('VALID MOVES: ', response.data.moves);
    // setValidMoves(response.data.moves.map((x: string) => formatMove(x)));
    console.log('SUBMITTED CONNECT TO LND');
    console.log('host: ', host);
    console.log('cert: ', cert);
    console.log('macaroon: ', macaroon);
  } catch (err) {
    console.log(err);
  }
};

export default ConnectForm;
