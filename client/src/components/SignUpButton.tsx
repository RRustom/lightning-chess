import { useState } from 'react';
import Button from '@mui/material/Button';
import ConnectForm from './ConnectForm';

const SignUpButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button variant="contained" onClick={() => setIsDialogOpen(true)}>
        Connect
      </Button>
      <ConnectForm isOpen={isDialogOpen} setIsOpen={setIsDialogOpen} />
    </>
  );
};

export default SignUpButton;
