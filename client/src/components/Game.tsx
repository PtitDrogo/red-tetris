import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../redux";

import { ClientMessage, GameInput, GameStatus } from "../../../shared/types";
import { useAuthGuard } from "../hooks/useAuthGuard";
import {
    clearGameOver,
    setPlayWithBlessed,
    setStatus,
} from "../redux/gameSlice";

import { MoveDown } from "lucide-react";
import GameOverOverlay from "../components/GameOverOverlay";
import { Score } from "../components/Score";
import { useGameGestures } from "../hooks/useGameGestures";
import { ControlsHelp } from "./ControlsHelp";
import Grid from "./Grid";
import { PiecePreview } from "./Piece";

function MainGrid() {
    const playerName = useSelector((state: RootState) => state.player.name);
    const grid = useSelector((state: RootState) => state.game.myGrid);
    const lineCleared = useSelector(
        (state: RootState) => state.game.myGrid.clearedLinesIndexes,
    );

    const [shakingLevel, setShakingLevel] = useState(0);
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (lineCleared && lineCleared.length > 0) {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            } else {
                setShakingLevel(lineCleared.length);
            }

            timerRef.current = setTimeout(() => {
                setShakingLevel(0);
                timerRef.current = null;
            }, 300);
        }
    }, [lineCleared]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const shakeAnimationClasses: { [key: number]: string } = {
        1: "animate-shake-1",
        2: "animate-shake-2",
        3: "animate-shake-3",
        4: "animate-shake-4",
    };

    return (
        <>
            <div
                className={`flex flex-col items-center w-[calc(10*clamp(14px,3.8dvh,32px))] ${
                    shakeAnimationClasses[shakingLevel] || ""
                }`}
            >
                <div className="flex items-center gap-4 py-1">
                    <PiecePreview type={grid.nextPiece} />
                    {playerName}
                </div>
                <Grid
                    grid={grid.board}
                    gridColsClass="grid-cols-10"
                    gridRowsClass="grid-rows-20"
                    cellSizeClass="w-[clamp(14px,3.8dvh,32px)] h-[clamp(14px,3.8dvh,32px)]"
                />
                <Score score={grid.score} level={grid.level} />
            </div>
        </>
    );
}

function OpponentGrid({ id }: { id: number }) {
    const grids = useSelector((state: RootState) => state.game.grids);

    const isPresent = grids[id]?.name && grids[id]?.name !== "Empty";
    return (
        <>
            <div
                className={`flex flex-col items-center transition-opacity duration-300 ${
                    isPresent ? "opacity-100" : "opacity-30"
                }`}
            >
                <div className="py-2 text-sm">{grids[id]?.name ?? "Empty"}</div>
                <Grid
                    grid={
                        grids[id]?.board ??
                        Array.from({ length: 20 }, () => Array(10).fill(0))
                    }
                    gridColsClass="grid-cols-10"
                    gridRowsClass="grid-rows-20"
                    cellSizeClass="w-4 h-4"
                />
                <Score score={grids[id]?.score ?? 0} />
            </div>
        </>
    );
}

function Game() {
    const navigate = useNavigate();
    const myGrid = useSelector((state: RootState) => state.game.myGrid);
    const ownerId = useSelector((state: RootState) => state.game.ownerId);
    const gameStatus = useSelector((state: RootState) => state.game.status);

    const dispatch = useDispatch();

    const gameStartButton =
        ownerId === myGrid?.id && gameStatus === GameStatus.WAITING;
    const playWithBlessed = useSelector(
        (state: RootState) => state.game.playWithBlessed,
    );
    const levelRef = useRef(0);

    useAuthGuard();
    useGameGestures(gameStatus === GameStatus.ONGOING);

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
                    e.preventDefault();
                    dispatch({
                        type: "socket/emit",
                        payload: { event: "i", data: GameInput.LEFT },
                    });
                    break;
                case "ArrowRight":
                    e.preventDefault();
                    dispatch({
                        type: "socket/emit",
                        payload: { event: "i", data: GameInput.RIGHT },
                    });
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    dispatch({
                        type: "socket/emit",
                        payload: { event: "i", data: GameInput.DOWN },
                    });
                    break;
                case "ArrowUp":
                    if (e.repeat) return;
                    e.preventDefault();
                    dispatch({
                        type: "socket/emit",
                        payload: { event: "i", data: GameInput.ROTATE },
                    });
                    break;
                case " ":
                    e.preventDefault();
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

    return (
        <>
            <div className="pointer-events-none fixed inset-0 flex flex-col justify-center items-center z-50 px-2">
                {gameStartButton && (
                    <div className="flex flex-col items-center w-full">
                        <label className="pointer-events-auto bg-gray-700/90 px-3 py-1 rounded-xl flex items-center gap-2 text-white text-lg select-none mb-2">
                            <input
                                type="checkbox"
                                className="w-5 h-5 accent-electric-red"
                                checked={playWithBlessed}
                                onChange={(e) =>
                                    dispatch(
                                        setPlayWithBlessed(e.target.checked),
                                    )
                                }
                            />
                            Play with{" "}
                            <span className="text-amber-400 animate-pulse">
                                Blessed
                            </span>{" "}
                            Pieces
                        </label>
                        <button
                            className="pointer-events-auto w-full max-w-xs mx-auto bg-electric-red hover:bg-red-400 text-white font-bold text-2xl px-6 py-7 rounded-xl shadow-2xl transform hover:scale-105 transition-all animate-shadow-pulse-red"
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
                    <div className="bg-gray-900/80 border-t border-b border-electric-red/50 px-20 py-8 text-center rounded-xl animate-shadow-pulse-red">
                        <span className="text-xl font-medium text-slate-300 tracking-wide animate-slow-pulse">
                            Waiting for host...
                        </span>
                    </div>
                )}
                {gameStatus === GameStatus.WAITING && <ControlsHelp />}
                <GameOverOverlay />
            </div>

            <div className="min-h-dvh flex justify-center items-center pt-4 sm:pt-10 lg:pt-20 gap-8 xl:gap-40 overflow-y-auto">
                <div className="hidden md:flex flex-col gap-20">
                    <OpponentGrid id={0}></OpponentGrid>
                    <OpponentGrid id={1}></OpponentGrid>
                </div>
                <MainGrid />
                <div className="hidden md:flex flex-col gap-20">
                    <OpponentGrid id={2}></OpponentGrid>
                    <OpponentGrid id={3}></OpponentGrid>
                </div>
            </div>
            {gameStatus === GameStatus.ONGOING && (
                <div className="fixed right-2 bottom-1/2 sm:hidden">
                    <button
                        type="button"
                        className="border border-white opacity-50 bg-gray-700 rounded-xl px-3 py-2 hover:opacity-100 transform hover:scale-105 transition-all"
                        onClick={() => {
                            dispatch({
                                type: "socket/emit",
                                payload: { event: "i", data: GameInput.SPACE },
                            });
                        }}
                    >
                        <MoveDown />
                    </button>
                </div>
            )}
            <div className="fixed bottom-3 right-3">
                <button
                    type="button"
                    className="border border-white opacity-50 bg-gray-700 rounded-xl px-3 py-2 sm:px-4 hover:opacity-100 transform hover:scale-105 transition-all"
                    onClick={() => {
                        dispatch(clearGameOver());
                        navigate("/lobbylist");
                    }}
                >
                    <span className="hidden sm:inline">Quit</span>
                    <span className="sm:hidden">✕</span>
                </button>
            </div>
        </>
    );
}

export default Game;
