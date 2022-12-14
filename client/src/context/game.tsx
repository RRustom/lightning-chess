import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import GameAPI from '../api/game';
import UserAPI from '../api/user';
import useGameWebSocket from '../hooks/useGameWebSocket';
import { Color, User, Move, Outcome } from '../global';
import useAuth from './auth';
import { useParams } from 'react-router-dom';

export type GameContextType = {
  gameUuid: string | undefined;
  currentFEN: string | undefined;
  outcome: string | null;
  positions: string[];
  opponent: User;
  validMoves: Move[];
  isMyTurn: boolean;
  sendMove: (move: string) => void;
  sendJoinGame: () => void;
  socket: WebSocket | null;
  receivedPrize: boolean;
};

const GameContextDefaults = {
  gameUuid: '',
  currentFEN: undefined,
  outcome: null,
  positions: [],
  opponent: { id: 0, userName: '', picture: 0 },
  validMoves: [],
  isMyTurn: false,
  sendMove: () => null,
  sendJoinGame: () => null,
  socket: null,
  receivedPrize: false,
};

export const GameContext = createContext<GameContextType>(GameContextDefaults);

export const GameProvider = ({ children }: any) => {
  const { userId, currentColor } = useAuth();
  const { uuid: gameUuid } = useParams();

  const [currentFEN, setCurrentFEN] = useState(undefined);
  const [outcome, setOutcome] = useState(null);
  const [positions, setPositions] = useState([]);
  const [opponent, setOpponent] = useState<User>({
    id: 0,
    userName: '',
    picture: 0,
  });
  const [validMoves, setValidMoves] = useState<Move[]>([]);
  const [currentTurn, setCurrentTurn] = useState(0);
  const [isMyTurn, setIsMyTurn] = useState(false);
  const [receivedPrize, setReceivedPrize] = useState(false);

  const { socket } = useGameWebSocket(
    currentColor == Color.White
      ? gameUuid
      : opponent && opponent.id && gameUuid
      ? gameUuid
      : undefined,
  );

  // Initialize the game
  useEffect(() => {
    if (gameUuid)
      __fetchGameData(gameUuid, setPositions, currentColor, setOpponent);
  }, [gameUuid]);

  // Fetch opponent data
  useEffect(() => {
    if (gameUuid && opponent.id) __fetchOpponentData(opponent.id, setOpponent);
  }, [gameUuid, opponent.id]);

  // Listen to updates to the board position
  useEffect(() => {
    if (!socket) return;
    socket.onmessage = function (evt) {
      const data = JSON.parse(evt.data);

      // if opponent joined
      if (currentColor !== Color.Black && data.blackId)
        setOpponent((x) => ({ ...x, id: data.blackId }));

      // if new position
      if (data.fen) {
        setCurrentFEN(data.fen);
      }

      // if new outcome
      if (data.outcome) {
        setOutcome(data.outcome);
      }

      // update turn number
      if (data.numTurn) {
        setCurrentTurn(data.numTurn);
      }
    };
  }, [socket]);

  // update when it's my turn
  useEffect(() => {
    if (currentColor === Color.White) setIsMyTurn(currentTurn % 2 == 0);
    if (currentColor === Color.Black) setIsMyTurn(currentTurn % 2 == 1);
  }, [currentTurn]);

  // fetch valid moves when it's my turn
  useEffect(() => {
    if (gameUuid && isMyTurn) {
      __fetchValidMoves(gameUuid, setValidMoves);
    }
  }, [gameUuid, isMyTurn]);

  // get paid when won
  useEffect(() => {
    if (gameUuid) {
      const isWinner =
        (outcome === Outcome.WhiteWon && currentColor === Color.White) ||
        (outcome === Outcome.BlackWon && currentColor === Color.Black);

      if (isWinner) __fetchWinningPayment(gameUuid, setReceivedPrize);
    }
  }, [gameUuid, outcome]);

  const sendMove = (move: string) => {
    if (!socket) return;
    socket.send(
      JSON.stringify({
        name: 'new_move',
        moveData: {
          playerId: userId,
          move,
          uuid: gameUuid,
        },
      }),
    );
    setValidMoves([]);
  };

  const sendJoinGame = () => {
    if (!socket) return;
    socket.send(
      JSON.stringify({
        name: 'opponent_join',
        joinGameData: {
          blackId: userId,
          uuid: gameUuid,
        },
      }),
    );
  };

  const memoedValue = useMemo(
    () => ({
      gameUuid,
      currentFEN,
      outcome,
      positions,
      opponent,
      validMoves,
      isMyTurn,
      sendMove,
      sendJoinGame,
      socket,
      receivedPrize,
    }),
    [
      gameUuid,
      currentFEN,
      outcome,
      positions,
      opponent,
      validMoves,
      isMyTurn,
      sendMove,
      sendJoinGame,
      socket,
      receivedPrize,
    ],
  );

  return (
    <GameContext.Provider value={memoedValue}>{children}</GameContext.Provider>
  );
};

const formatMove = (uci: string): Move => {
  return { from: uci.substring(0, 2), to: uci.substring(2, 4), uci };
};

const __fetchValidMoves = async (
  gameUuid: string,
  setValidMoves: (x: any) => void,
) => {
  try {
    if (!gameUuid) return;
    const response = await GameAPI.getValidMoves(gameUuid);
    setValidMoves(response.data.moves.map((x: string) => formatMove(x)));
  } catch (err) {
    console.log(err);
  }
};

const __fetchGameData = async (
  gameUuid: string,
  setPositions: any,
  currentColor: Color,
  setOpponent: any,
) => {
  try {
    const response = await GameAPI.getGameByUuid(gameUuid);
    setPositions(response.data.positions);

    if (currentColor === Color.Black) {
      setOpponent((x: User) => ({ ...x, id: response.data.whiteId }));
    } else {
      setOpponent((x: User) => ({ ...x, id: response.data.blackId }));
    }
  } catch (err) {
    console.log(err);
  }
};

const __fetchOpponentData = async (opponentId: number, setOpponent: any) => {
  try {
    const response = await UserAPI.getUserById(opponentId);
    setOpponent({
      id: opponentId,
      userName: response.data.userName,
      picture: response.data.picture,
    });
  } catch (err) {
    console.log(err);
  }
};

const __fetchWinningPayment = async (
  gameUuid: string,
  setReceivedPrize: any,
) => {
  try {
    await GameAPI.getWinningInvoice(gameUuid);

    setReceivedPrize(true);
  } catch (err) {
    console.log(err);
  }
};

export default function useGame() {
  return useContext(GameContext);
}
