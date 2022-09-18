import { useRef, useState, useEffect, RefObject } from 'react';
import { Chessboard } from 'react-chessboard';
import GameAPI from '../api/game';
import useAuth from '../context/auth'
import {useParams} from "react-router-dom";
// import Chess from 'chess.js';
// import Chessground from '@react-chess/chessground';

const STARTING_POSITION = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'

export default function ChessBoard() {
    const {userId} = useAuth();
    const chessboardRef = useRef();
    const [currentFEN, setCurrentFEN] = useState<string|undefined>(undefined)
    const [outcome, setOutcome] = useState<string|null>(null);
    const [validMoves, setValidMoves] = useState<string[]>([]);
    const { uuid: gameUuid } = useParams();

    useEffect(() => {
        // TODO: initialize the game
        getValidMoves()
    }, [])

    // const makeAMove(move: any) {
    //     const gameCopy = { ...game };
    //     const result = gameCopy.move(move);
    //     setGame(gameCopy);
    //     return result; // null if the move was illegal, the move object if the move was legal
    // }

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

    const getValidMoves = async () => {
        try {
            if (!gameUuid) return;
            const response = await GameAPI.getValidMoves(gameUuid);
            console.log('VALID MOVES: ', response.data.moves)
            setValidMoves(response.data.moves)
        } catch(err) {
            console.log(err)
        }
    }

    const postMove = async (move: string) => {
        try {
            if (!gameUuid) return;
            const response = await GameAPI.move(gameUuid, userId, move);
            setCurrentFEN(response.data.fen)
        } catch(err) {
            console.log(err)
        }
    }

    // ref={chessboardRef}

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