import { createContext, useContext, useEffect, useState, useMemo } from 'react';
import GameAPI from '../api/game';
import useAuth from './auth';
import useGame from './game';

const AMOUNT = 1000; // in satoshis

export type PaymentContextType = {
  paymentRequest: string;
  amount: number;
  isPaymentSuccess: boolean;
  canStartGame: boolean;
};

const PaymentContextDefaults = {
  paymentRequest: '',
  amount: AMOUNT,
  isPaymentSuccess: false,
  canStartGame: false,
};

export const PaymentContext = createContext<PaymentContextType>(
  PaymentContextDefaults,
);

export const PaymentProvider = ({ children }: any) => {
  const { userId } = useAuth();
  const { gameUuid, opponent, socket } = useGame();

  const [paymentRequest, setPaymentRequest] = useState('');
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const [canStartGame, setCanStartGame] = useState(false);

  useEffect(() => {
    // if opponent joined, fetch invoice
    if (gameUuid && !isPaymentSuccess && opponent && opponent.id) {
      __fetchStartInvoice(gameUuid, setPaymentRequest);
    }
  }, [opponent.id, gameUuid]);

  // Listen to updates to the board position
  useEffect(() => {
    if (!socket) return;
    socket.addEventListener('message', function (evt) {
      const data = JSON.parse(evt.data);

      // this player completed their payment successfully
      if (data.playerId == userId) {
        setIsPaymentSuccess(true);
      }

      // the other player also completed their payment
      if (data.canStartGame) setCanStartGame(true);
    });
  }, [socket]);

  const memoedValue = useMemo(
    () => ({
      paymentRequest,
      amount: AMOUNT,
      isPaymentSuccess,
      canStartGame,
    }),
    [paymentRequest, isPaymentSuccess, canStartGame],
  );

  return (
    <PaymentContext.Provider value={memoedValue}>
      {children}
    </PaymentContext.Provider>
  );
};

const __fetchStartInvoice = async (
  gameUuid: string,
  setPaymentRequest: any,
) => {
  try {
    const response = await GameAPI.getStartInvoice(gameUuid);
    setPaymentRequest(response.data.paymentRequest);
  } catch (err) {
    console.log(err);
  }
};

export default function usePayment() {
  return useContext(PaymentContext);
}
