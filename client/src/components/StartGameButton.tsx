import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../context/auth';
import GameAPI from '../api/game';
import Button from '@mui/material/Button';

const StartGameButton = () => {
  const { userId, startGame } = useAuth();
  const navigate = useNavigate();

  const createNewGame = async () => {
    try {
      const response = await GameAPI.newGame(userId);
      startGame();
      if (response.data) navigate(`/${response.data}`);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Button variant="contained" onClick={() => createNewGame()}>
      New Game
    </Button>
  );
};

export default StartGameButton;
