import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../redux";

import {
    ClientMessage,
    GameInput,
    GameStatus,
    GRID_STATES,
    PieceType,
} from "../../../shared/types";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { setStatus } from "../redux/gameSlice";

import GameOverOverlay from "../components/GameOverOverlay";
import { Score } from "../components/Score";
import Grid from "./Grid";
import { PiecePreview } from "./Piece";

type gridProps = {
    playerName: string;
    grid: GRID_STATES[][];
    score: number;
    level?: number;
    nextPiece?: PieceType;
};

function MainGrid({ playerName, grid, score, nextPiece, level }: gridProps) {
    return (
        <>
            <div className="flex flex-col items-center">
                <div className="flex items-center gap-4 py-1">
                    <PiecePreview type={nextPiece} />
                    {playerName}
                </div>
                <Grid
                    grid={grid}
                    gridColsClass="grid-cols-10"
                    gridRowsClass="grid-rows-20"
                    cellSizeClass="w-8 h-8"
                />
                <Score score={score} level={level} />
            </div>
        </>
    );
}

function OpponentGrid({ playerName: opponentName, grid, score }: gridProps) {
    const isPresent = opponentName !== "Empty";
    return (
        <>
            <div
                className={`flex flex-col items-center transition-opacity duration-300 ${
                    isPresent ? "opacity-100" : "opacity-30"
                }`}
            >
                <div className="py-2 text-sm">{opponentName}</div>
                <Grid
                    grid={grid}
                    gridColsClass="grid-cols-10"
                    gridRowsClass="grid-rows-20"
                    cellSizeClass="w-4 h-4"
                />
                <Score score={score} />
            </div>
        </>
    );
}

function Game() {
    const navigate = useNavigate();
    const playerName = useSelector((state: RootState) => state.player.name);
    const gameGrids = useSelector((state: RootState) => state.game.grids);
    const myGrid = useSelector((state: RootState) => state.game.myGrid);
    const ownerId = useSelector((state: RootState) => state.game.ownerId);
    const gameStatus = useSelector((state: RootState) => state.game.status);

    useEffect(() => {
        if (myGrid.clearedLinesIndexes?.[0]) console.log("LINE CLEARED OMG");
    }, [myGrid]);

    const dispatch = useDispatch();

    const gameStartButton =
        ownerId === myGrid?.id && gameStatus === GameStatus.WAITING;
    const [playWithBlessed, setPlayWithBlessed] = useState(false);
    const levelRef = useRef(0);

    useAuthGuard();

    useEffect(() => {
        dispatch({ type: "socket/initGame" });

        return () => {
            dispatch({ type: "socket/cleanupGame" });
            dispatch(setStatus(GameStatus.WAITING));
        };
    }, [dispatch]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowLeft":
                    dispatch({
                        type: "socket/emit",
                        payload: { event: "i", data: GameInput.LEFT },
                    });
                    break;
                case "ArrowRight":
                    dispatch({
                        type: "socket/emit",
                        payload: { event: "i", data: GameInput.RIGHT },
                    });
                    break;
                case "ArrowDown":
                    dispatch({
                        type: "socket/emit",
                        payload: { event: "i", data: GameInput.DOWN },
                    });
                    break;
                case "ArrowUp":
                    if (e.repeat) return;
                    dispatch({
                        type: "socket/emit",
                        payload: { event: "i", data: GameInput.ROTATE },
                    });
                    break;
                case " ":
                    dispatch({
                        type: "socket/emit",
                        payload: { event: "i", data: GameInput.SPACE },
                    });
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [dispatch]);

    const emptyGrid = Array.from({ length: 20 }, () => Array(10).fill(0));
    return (
        <>
            {gameStartButton && (
                <div className="pointer-events-none fixed inset-0 flex flex-col justify-center items-center z-50">
                    <label className="pointer-events-auto bg-gray-700/90 px-3 py-1 rounded-xl flex items-center gap-2 text-white text-lg select-none mb-2">
                        <input
                            type="checkbox"
                            className="w-5 h-5 accent-electric-red"
                            checked={playWithBlessed}
                            onChange={(e) =>
                                setPlayWithBlessed(e.target.checked)
                            }
                        />
                        Play with <span className="text-amber-400 animate-pulse">Blessed</span> Pieces
                    </label>
                    <button
                        className="pointer-events-auto bg-electric-red hover:bg-red-400 text-white font-bold text-2xl px-35 py-7 rounded-xl shadow-2xl transform hover:scale-105 transition-all animate-shadow-pulse2"
                        onClick={() => {
                            dispatch({
                                type: "socket/emit",
                                payload: {
                                    event: ClientMessage.START_GAME,
                                    data: { playWithBlessed },
                                },
                            });
                        }}
                    >
                        <span className="animate-slow-pulse">START</span>
                    </button>
                </div>
            )}
            {gameStatus === GameStatus.WAITING && !gameStartButton && (
                <div className="pointer-events-none fixed inset-0 flex justify-center items-center z-50">
                    <div className="bg-gray-900/80 border-t border-b border-electric-red/50 px-20 py-8 text-center rounded-xl animate-shadow-pulse2">
                        <span className="text-xl font-medium text-slate-300 tracking-wide animate-slow-pulse">
                            Waiting for host...
                        </span>
                    </div>
                </div>
            )}
            <GameOverOverlay />

            <div className="flex justify-center items-center pt-20 gap-40">
                <div className="flex flex-col gap-20">
                    <OpponentGrid
                        playerName={gameGrids[0]?.name ?? "Empty"}
                        grid={gameGrids[0]?.board ?? emptyGrid}
                        score={gameGrids[0]?.score ?? 0}
                    ></OpponentGrid>
                    <OpponentGrid
                        playerName={gameGrids[1]?.name ?? "Empty"}
                        grid={gameGrids[1]?.board ?? emptyGrid}
                        score={gameGrids[1]?.score ?? 0}
                    ></OpponentGrid>
                </div>
                <MainGrid
                    playerName={myGrid?.name}
                    grid={myGrid?.board ?? emptyGrid}
                    score={myGrid.score}
                    level={myGrid.level}
                    nextPiece={myGrid.nextPiece}
                ></MainGrid>
                <div className="flex flex-col gap-20">
                    <OpponentGrid
                        playerName={gameGrids[2]?.name ?? "Empty"}
                        grid={gameGrids[2]?.board ?? emptyGrid}
                        score={gameGrids[2]?.score ?? 0}
                    ></OpponentGrid>
                    <OpponentGrid
                        playerName={gameGrids[3]?.name ?? "Empty"}
                        grid={gameGrids[3]?.board ?? emptyGrid}
                        score={gameGrids[3]?.score ?? 0}
                    ></OpponentGrid>
                </div>
            </div>
            <div className="fixed bottom-4 right-4">
                <input
                    type="button"
                    className="border border-white px-3"
                    value="Quit"
                    onClick={() => navigate("/lobbylist")}
                ></input>
            </div>
        </>
    );
}

export default Game;
