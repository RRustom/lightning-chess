import React, {useEffect, useState} from 'react';
import StartGameButton from '../components/StartGameButton';
import SignUpButton from '../components/SignUpButton';
import useAuth from '../context/auth';

const LandingPage = () => {
  const { userName } = useAuth();
  const [redirectTo, setRedirectTo] = useState<string>("");

  useEffect(() => {
    const cachedGameUuid = window.localStorage.getItem('gameUuid');
    if (cachedGameUuid) {
      window.localStorage.removeItem('gameUuid');
      setRedirectTo(cachedGameUuid)
    }
  }, [])

  return (
    <div>
      <h1>Welcome to Lightning Chess ⚡</h1>
      <SignUpButton />
      {userName && !redirectTo && <StartGameButton />}
    </div>
  );
};

export default LandingPage;
