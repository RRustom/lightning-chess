import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
} from 'react';
import { parseGame } from '@mliebelt/pgn-parser';
import GameAPI from '../api/game';
import UserAPI from '../api/user';
import useGameWebSocket from '../hooks/useGameWebSocket';
import { Color, User, Move } from '../global';
import useAuth from './auth';
import useGame from './game';

export type PaymentContextType = {
  paymentRequest: string;
  amount: number;
  isPaymentSuccess: boolean;
  canStartGame: boolean;
};

const PaymentContextDefaults = {
  paymentRequest: '',
  amount: 100,
  isPaymentSuccess: false,
  canStartGame: false,
};

export const PaymentContext = createContext<PaymentContextType>(
  PaymentContextDefaults,
);

export const PaymentProvider = ({ children }: any) => {
  const { userId, currentColor } = useAuth();
  const { gameUuid } = useGame();

  const [paymentRequest, setPaymentRequest] = useState(
    'some super long lnd payment request',
  );
  const [amount, setAmount] = useState(100); // in satoshis
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [canStartGame, setCanStartGame] = useState(false);

  //   const { socket } = useGameWebSocket(
  //     currentColor == Color.White
  //       ? gameUuid
  //       : opponent && opponent.id && gameUuid
  //       ? gameUuid
  //       : undefined,
  //   );

  // Initialize the game
  //   useEffect(() => {
  //     if (gameUuid)
  //       __fetchGameData(
  //         gameUuid,
  //         setPositions,
  //         setPgn,
  //         currentColor,
  //         setOpponent,
  //         setMoves,
  //       );
  //   }, [gameUuid]);

  // Fetch opponent data
  //   useEffect(() => {
  //     if (gameUuid && opponent.id)
  //       __fetchOpponentData(gameUuid, opponent.id, setOpponent);
  //   }, [gameUuid, opponent.id]);

  // Listen to updates to the board position
  //   useEffect(() => {
  //     if (!socket) return;
  //     socket.onmessage = function (evt) {
  //       console.log('RECEIVED WS DATA: ', evt.data);
  //       const data = JSON.parse(evt.data);

  //       // if opponent joined
  //       if (currentColor !== Color.Black && data.blackId)
  //         setOpponent((x) => ({ ...x, id: data.blackId }));

  //       // if new position
  //       if (data.fen) {
  //         console.log('UPDATED FEN: ', data.fen);
  //         setCurrentFEN(data.fen);
  //       }

  //       // if new outcome
  //       if (data.outcome) {
  //         setOutcome(data.outcome);
  //       }

  //       // update turn number
  //       if (data.numTurn) {
  //         setCurrentTurn(data.numTurn);
  //       }
  //     };
  //   }, [socket]);

  //   // update when it's my turn
  //   useEffect(() => {
  //     if (currentColor === Color.White) setIsMyTurn(currentTurn % 2 == 0);
  //     if (currentColor === Color.Black) setIsMyTurn(currentTurn % 2 == 1);
  //   }, [currentTurn]);

  //   // fetch valid moves when it's my turn
  //   useEffect(() => {
  //     console.log('IS MY TURN: ', isMyTurn);
  //     if (gameUuid && isMyTurn) {
  //       __fetchValidMoves(gameUuid, userId, setValidMoves);
  //     }
  //   }, [gameUuid, isMyTurn]);

  const memoedValue = useMemo(
    () => ({
      paymentRequest,
      amount,
      isPaymentSuccess,
      canStartGame,
    }),
    [paymentRequest, amount, isPaymentSuccess, canStartGame],
  );

  return (
    <PaymentContext.Provider value={memoedValue}>
      {children}
    </PaymentContext.Provider>
  );
};

// const __fetchValidMoves = async (
//   gameUuid: string,
//   playerId: number,
//   setValidMoves: (x: any) => void,
// ) => {
//   try {
//     if (!gameUuid) return;
//     const response = await GameAPI.getValidMoves(gameUuid);
//     console.log('VALID MOVES: ', response.data.moves);
//     setValidMoves(response.data.moves.map((x: string) => formatMove(x)));
//   } catch (err) {
//     console.log(err);
//   }
// };

// const __fetchGameData = async (
//   gameUuid: string,
//   setPositions: any,
//   setPgn: any,
//   currentColor: Color,
//   setOpponent: any,
//   setMoves: any,
// ) => {
//   try {
//     const response = await GameAPI.getGameByUuid(gameUuid);
//     console.log('FETCHED GAME: ', response.data);
//     setPositions(response.data.positions);
//     // setPgn(response.data.pgn);
//     // setMoves(parseGame(response.data.pgn).moves);
//     if (currentColor === Color.Black) {
//       setOpponent((x: User) => ({ ...x, id: response.data.whiteId }));
//     } else {
//       setOpponent((x: User) => ({ ...x, id: response.data.blackId }));
//     }
//   } catch (err) {
//     console.log(err);
//   }
// };

export default function usePayment() {
  return useContext(PaymentContext);
}
