import { useRef, useState, useEffect, RefObject } from 'react';
import { Chessboard } from 'react-chessboard';
import GameAPI from '../api/game';
import useAuth from '../context/auth'
import {useParams} from "react-router-dom";
// import Chess from 'chess.js';
// import Chessground from '@react-chess/chessground';

const STARTING_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export interface Move {
    from: string,
    to: string,
    uci: string
}

export default function ChessBoard() {
    const {userId} = useAuth();
    const chessboardRef = useRef();
    const [currentFEN, setCurrentFEN] = useState<string|undefined>(undefined)
    const [outcome, setOutcome] = useState<string|null>(null);
    const [validMoves, setValidMoves] = useState<Move[]>([]);
    const { uuid: gameUuid } = useParams();

    const [moveFrom, setMoveFrom] = useState('');
    const [rightClickedSquares, setRightClickedSquares] = useState({});
    const [moveSquares, setMoveSquares] = useState({});
    const [optionSquares, setOptionSquares] = useState({});

    useEffect(() => {
        // TODO: initialize the game
        getValidMoves(gameUuid, userId, setValidMoves)
    }, [])

    // const makeAMove(move: any) {
    //     const gameCopy = { ...game };
    //     const result = gameCopy.move(move);
    //     setGame(gameCopy);
    //     return result; // null if the move was illegal, the move object if the move was legal
    // }

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
            await makeMove(gameUuid, userId, move, setCurrentFEN)
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
            {/* <button
                className="rc-button"
                onClick={() => {
                safeGameMutate((game) => {
                    game.reset();
                });
                chessboardRef.current.clearPremoves();
                }}
            >
            reset
            </button>
            <button
                className="rc-button"
                onClick={() => {
                safeGameMutate((game) => {
                    game.undo();
                });
                chessboardRef.current.clearPremoves();
                }}
            >
            undo
            </button> */}
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

const makeMove = async (gameUuid: string|undefined, playerId: number, move: string, setCurrentFen: (x: any) => void) => {
    try {
        if (!gameUuid) return;
        const response = await GameAPI.move(gameUuid, playerId, move);
        console.log('UPDATED FEN: ', response.data.fen)
        setCurrentFen(response.data.fen)
        // setValidMoves(response.data.moves.map((x: string) => parseUCI(x)))
    } catch(err) {
        console.log(err)
    }
}

// export default function PlayVsPlay({ boardWidth }: ChessBoardProps): JSX.Element {
//   const chessboardRef = useRef();
//   const [game, setGame] = useState(new Chess());

//   function safeGameMutate(modify) {
//     setGame((g) => {
//       const update = { ...g };
//       modify(update);
//       return update;
//     });
//   }

//   function onDrop(sourceSquare, targetSquare) {
//     const gameCopy = { ...game };
//     const move = gameCopy.move({
//       from: sourceSquare,
//       to: targetSquare,
//       promotion: 'q' // always promote to a queen for example simplicity
//     });
//     setGame(gameCopy);
//     return move;
//   }

//   return (
//     <div>
//       <Chessboard
//         id="PlayVsPlay"
//         animationDuration={200}
//         boardWidth={boardWidth}
//         position={game.fen()}
//         onPieceDrop={onDrop}
//         customBoardStyle={{
//           borderRadius: '4px',
//           boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
//         }}
//         ref={chessboardRef}
//       />
//       <button
//         className="rc-button"
//         onClick={() => {
//           safeGameMutate((game) => {
//             game.reset();
//           });
//           chessboardRef.current.clearPremoves();
//         }}
//       >
//         reset
//       </button>
//       <button
//         className="rc-button"
//         onClick={() => {
//           safeGameMutate((game) => {
//             game.undo();
//           });
//           chessboardRef.current.clearPremoves();
//         }}
//       >
//         undo
//       </button>
//     </div>
//   );
// }