import { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import useAuth from '../context/auth';
import { Color, Move, Outcome } from '../global';
import useGame from '../context/game';
import useWindowSize from '../hooks/useWindowSize';
import Confetti from 'react-confetti';
import InvoiceModal from './InvoiceModal';
import usePayment from '../context/payment';
import GameInfo from './GameInfo';

export default function ChessBoard() {
  const { currentColor } = useAuth();
  const [moveFrom, setMoveFrom] = useState('');
  const [optionSquares, setOptionSquares] = useState({});
  const [showConfetti, setShowConfetti] = useState(false);
  const size = useWindowSize();

  const { gameUuid, validMoves, opponent, sendMove, currentFEN, outcome } =
    useGame();
  const { canStartGame } = usePayment();
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(true);

  useEffect(() => {
    if (canStartGame) {
      setTimeout(() => setIsInvoiceModalOpen(false), 2000);
    }
  }, [canStartGame]);

  useEffect(() => {
    if (outcome === Outcome.WhiteWon) {
      setShowConfetti(currentColor === Color.White);
    } else if (outcome === Outcome.BlackWon) {
      setShowConfetti(currentColor === Color.Black);
    }
  }, [outcome]);

  const makeMove = async (move: string) => {
    try {
      if (!gameUuid) return;

      sendMove(move);
    } catch (err) {
      console.log(err);
    }
  };

  const getMoveOptions = (square: string) => {
    if (validMoves.length === 0) {
      return;
    }
    const validMovesForSquare = validMoves.filter((x) => x.from === square);

    const newSquares = {} as any;

    for (const m of validMoves) {
      newSquares[m.to] = { background: 'none' };
    }

    for (const m of validMovesForSquare) {
      newSquares[m.to] = {
        background:
          'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
    }

    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };
    setOptionSquares(newSquares);
  };

  const onSquareClick = async (square: string) => {
    function resetFirstMove(square: string) {
      setMoveFrom(square);
      getMoveOptions(square);
    }

    // if square was NOT an option, then reset options
    const move = moveToUCI(moveFrom, square);

    if (!isValidMove(move, validMoves)) {
      resetFirstMove(square);
    } else {
      // is square was a valid move, then play it
      await makeMove(move);
      setMoveFrom('');
      setOptionSquares({});
    }
  };

  function onDrop(sourceSquare: string, targetSquare: string) {
    return true;
  }

  const customSquareStyles = {
    ...optionSquares,
  };

  return (
    <div
      style={{
        display: 'flex',
        flexFlow: 'column nowrap',
        alignItems: 'center',
        height: '100%',
      }}
    >
      <Confetti
        width={size.width}
        height={size.height}
        run={showConfetti}
        numberOfPieces={400}
        recycle={false}
      />

      <GameInfo />
      <Chessboard
        animationDuration={200}
        boardWidth={744}
        position={currentFEN}
        onPieceDrop={onDrop}
        customBoardStyle={{
          borderRadius: '4px',
          boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)',
        }}
        boardOrientation={currentColor}
        onSquareClick={onSquareClick}
        customSquareStyles={customSquareStyles}
      />
      <InvoiceModal isOpen={isInvoiceModalOpen} />
    </div>
  );
}

const isValidMove = (uci: string, validMoves: Move[]): boolean => {
  return validMoves.filter((x) => x.uci === uci).length === 1;
};

const moveToUCI = (from: string, to: string): string => {
  return from + to;
};
