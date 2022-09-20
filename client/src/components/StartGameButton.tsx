import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../context/auth';
import GameAPI from '../api/game';

const StartGameButton = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();

  const createNewGame = async () => {
    try {
      const response = await GameAPI.newGame(userId);
      if (response.data) navigate(`/${response.data}`);
    } catch (err) {
      console.log(err);
    }
  };

  return <button onClick={() => createNewGame()}>Start Game</button>;
};

export default StartGameButton;
