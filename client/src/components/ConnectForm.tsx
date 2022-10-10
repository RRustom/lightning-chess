import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useAuth from '../context/auth';

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const ConnectForm = (props: Props) => {
  const { connectToNode, userName } = useAuth();
  const [host, setHost] = useState('');
  const [cert, setCert] = useState('');
  const [macaroon, setMacaroon] = useState('');

  useEffect(() => {
    if (userName) handleClose();
  }, [userName]);

  const handleSubmit = (evt: any) => {
    evt.preventDefault();
    connectToNode(host, cert, macaroon);
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

export default ConnectForm;
