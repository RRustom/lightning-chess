import { useRef, useState, useEffect, RefObject } from 'react';
import { Chessboard } from 'react-chessboard';
import GameAPI from '../api/game';
import useAuth from '../context/auth'
import {useParams} from "react-router-dom";
import useMoves from '../hooks/useMoves'; 
// import Chess from 'chess.js';
// import Chessground from '@react-chess/chessground';

const STARTING_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export interface Move {
    from: string,
    to: string,
    uci: string
}

export default function ChessBoard() {
    const {userId, currentColor} = useAuth();
    const chessboardRef = useRef();
    const [currentFEN, setCurrentFEN] = useState<string|undefined>(undefined)
    const [outcome, setOutcome] = useState<string|null>(null);
    const [validMoves, setValidMoves] = useState<Move[]>([]);
    const { uuid: gameUuid } = useParams();

    const {moves, sendMove, isMyTurn} = useMoves(gameUuid)

    const [moveFrom, setMoveFrom] = useState('');
    const [rightClickedSquares, setRightClickedSquares] = useState({});
    const [moveSquares, setMoveSquares] = useState({});
    const [optionSquares, setOptionSquares] = useState({});

    useEffect(() => {
        console.log('IS MY TURN: ', isMyTurn)
        console.log('COLOR: ', currentColor)
        if (isMyTurn) {
            getValidMoves(gameUuid, userId, setValidMoves)
        }
    }, [isMyTurn])

    
    const makeMove = async (move: string) => {
        try {
            if (!gameUuid) return;
            
            sendMove(move)
            // const response = await GameAPI.move(gameUuid, playerId, move);
            // console.log('UPDATED FEN: ', response.data.fen)
            // setCurrentFEN(response.data.fen)
            // setValidMoves(response.data.moves.map((x: string) => parseUCI(x)))

        } catch(err) {
            console.log(err)
        }
    }

    function getMoveOptions(square: string) {
        // const moves = game.moves({
        //     square,
        //     verbose: true
        // });
        if (validMoves.length === 0) {
            return;
        }

        console.log('Computing move options for: ', square)
        console.log('Valid moves: ', validMoves)

        const validMovesForSquare = validMoves.filter(x => x.from === square);


        const newSquares = {} as any;

        for (const m of validMoves) {
            newSquares[m.to] = {background: 'none'}
        }

        for (const m of validMovesForSquare) {
            newSquares[m.to] = {background: 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)', borderRadius: '50%'}
        }


        
        
        // validMoves.filter(x => x.from === square)

        
        // validMoves.map((move) => {



        //     console.log(`is ${square} === ${move.from}: `, square === move.from)
        //     newSquares[move.to] = {
        //     background: square === move.from ? 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)' : 'none',
            
        //     // 'radial-gradient(12px at center, rgba(0,0,0,.1) 85%, transparent 85%)',
        //     //     // game.get(move.to) && game.get(move.to).color !== game.get(square).color
        //     //     // ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
        //     //     // : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        //     borderRadius: '50%'
        //     }
        //     return move;
        // });
        newSquares[square] = {
            background: 'rgba(255, 255, 0, 0.4)'
        }
        console.log('NEW SQUARES: ', newSquares)
        setOptionSquares(newSquares);
    }

    async function onSquareClick(square: string) {
        setRightClickedSquares({});

        console.log('SQUARE: ', square)
        console.log('moveFrom: ', moveFrom)
    
        function resetFirstMove(square: string) {
          setMoveFrom(square);
          getMoveOptions(square);
        }

        console.log('OPTION SQUARES: ', optionSquares)
    
        // if square was NOT an option, then reset options
        const move = moveToUCI(moveFrom, square)
        console.log('move: ', move)
        console.log('is valid move: ', isValidMove(move, validMoves))

        if (!isValidMove(move, validMoves)) {
            resetFirstMove(square);
        } else {
            // is square was a valid move, then play it
            await makeMove(move)
            setMoveFrom('');
            setOptionSquares({});
        }


        // if (!moveFrom) {
        //   resetFirstMove(square);
        //   return;
        // }

        // is square was a valid move, then play it
        // if (isValidMove(move, validMoves)) {
        //     await makeMove(gameUuid, userId, move, setCurrentFEN)
        //     setMoveFrom('');
        //     setOptionSquares({});
        // } 
        
        // else {
        //     // resetFirstMove(square);
        //     setMoveFrom('');
        //     setOptionSquares({});
        //     return;
        // }

        
        // if invalid, setMoveFrom and getMoveOptions
        // if (move === null) {
        //   resetFirstMove(square);
        //   return;
        // }
    
        //setTimeout(makeRandomMove, 300);
        
      }
    
    //   function onSquareRightClick(square) {
    //     const colour = 'rgba(0, 0, 255, 0.4)';
    //     setRightClickedSquares({
    //       ...rightClickedSquares,
    //       [square]:
    //         rightClickedSquares[square] && rightClickedSquares[square].backgroundColor === colour
    //           ? undefined
    //           : { backgroundColor: colour }
    //     });
    //   }    

    function onDrop(sourceSquare: string, targetSquare: string) {
        // const move = makeAMove({
        //     from: sourceSquare,
        //     to: targetSquare,
        //     promotion: 'q' // always promote to a queen for example simplicity
        // });

        console.log('Source: ', sourceSquare, ' Target: ', targetSquare)

        // illegal move
        // if (move === null) return false;
        
        // setTimeout(makeRandomMove, 200);
        return true;
    }

    // onSquareRightClick={onSquareRightClick}

    const customSquareStyles = {
                    ...moveSquares,
                    ...optionSquares,
                    //...rightClickedSquares
                }
    console.log('CUSTOM SQUARE STYLES: ', customSquareStyles)

    return (
        <div>
            <Chessboard
                animationDuration={200}
                boardWidth={500}
                position={currentFEN}
                onPieceDrop={onDrop}
                customBoardStyle={{
                    borderRadius: '4px',
                    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
                }}

                onSquareClick={onSquareClick}
                
                customSquareStyles={customSquareStyles}
                
            />
        </div>
    )
}

const isValidMove = (uci: string, validMoves: Move[]): boolean => {
    return validMoves.filter(x => x.uci === uci).length === 1
}

const moveToUCI = (from: string, to: string): string => {
    return from + to
}

const formatMove = (uci: string): Move => {
    return {from: uci.substring(0, 2), to: uci.substring(2, 4), uci}
}

const getValidMoves = async (gameUuid: string|undefined, playerId: number, setValidMoves: (x: any) => void) => {
    try {
        if (!gameUuid) return;
        const response = await GameAPI.getValidMoves(gameUuid);
        console.log('VALID MOVES: ', response.data.moves)
        setValidMoves(response.data.moves.map((x: string) => formatMove(x)))
    } catch(err) {
        console.log(err)
    }
}