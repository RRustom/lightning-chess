import React from 'react';
import StartGameButton from '../components/StartGameButton';
import SignUpButton from '../components/SignUpButton';
import useAuth from '../context/auth';

const LandingPage = () => {
  const { userName } = useAuth();
  return (
    <div>
      <h1>Welcome to Lightning Chess ⚡</h1>
      <SignUpButton />
      {userName && <StartGameButton />}
    </div>
  );
};

export default LandingPage;
