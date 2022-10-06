import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import StartGameButton from '../components/StartGameButton';
import SignUpButton from '../components/SignUpButton';
import useAuth from '../context/auth';

const LandingPage = () => {
  const { userName } = useAuth();
  const [redirectTo, setRedirectTo] = useState<string>('');

  useEffect(() => {
    const cachedGameUuid = window.localStorage.getItem('gameUuid');
    if (cachedGameUuid) {
      window.localStorage.removeItem('gameUuid');
      setRedirectTo(cachedGameUuid);
    }
  }, []);

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
      <h1>Welcome to Lightning Chess ⚡</h1>
      <SignUpButton />
      {userName && !redirectTo && <StartGameButton />}
      {userName && redirectTo && <Navigate replace to={redirectTo} />}
    </div>
  );
};

export default LandingPage;
