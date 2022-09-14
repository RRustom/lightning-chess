import * as React from 'react';
import { Link } from "react-router-dom";

const GAME_UUID = "ef6a9765-a9a9-4b6a-8716-447bc4474d65"

const StartGameButton = () => {
  return (
    <button>
        <Link to={GAME_UUID}>Start Game</Link>
    </button>
  );
}

export default StartGameButton
