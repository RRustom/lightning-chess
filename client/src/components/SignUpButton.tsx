import React from 'react';
import useAuth from '../context/auth';

const SignUpButton = () => {
  const { userName, signUp } = useAuth();

  if (userName) return <div>Welcome, {userName}!</div>;

  return <button onClick={() => signUp()}>Sign Up</button>;
};

export default SignUpButton;
