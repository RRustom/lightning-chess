import React, { useState } from 'react';
import useAuth from '../context/auth';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import ConnectForm from './ConnectForm';

const SignUpButton = () => {
  const { userName } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const navigate = useNavigate();

  // return <button onClick={() => signUp()}>Sign Up</button>;
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
