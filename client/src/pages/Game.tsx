import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux";
import { useState, useEffect, useRef } from "react";
import { socket } from "../socket";

import {
    setGrids,
    setMyGrid,
    setOwner,
    setStatus,
    type PlayerGrid,
} from "../redux/gameSlice";
import { useAuthGuard } from "../hooks/useAuthGuard";
import {
    ClientMessage,
    GameInput,
    GameOverRanking,
    GameStatus,
    GRID_STATES,
    RoomPlayers,
    ServerMessage,
} from "../../../shared/types";
import { Crown } from "lucide-react";
import { current } from "@reduxjs/toolkit";

const cellColor: Record<GRID_STATES, string> = {
    [GRID_STATES.EMPTY]: "",
    [GRID_STATES.RED]: "bg-red-400",
    [GRID_STATES.BLUE]: "bg-blue-400",
    [GRID_STATES.GREEN]: "bg-green-300",
    [GRID_STATES.ORANGE]: "bg-amber-300",
    [GRID_STATES.GHOST]: "bg-gray-300 opacity-50",
    [GRID_STATES.BLOCKED]: "bg-gray-700",
};

function MainGrid({
    playerName,
    grid,
    score,
    level,
}: {
    playerName: string;
    grid: GRID_STATES[][];
    score: number;
    level: number;
}) {
    return (
        <>
            <div className="flex flex-col items-center">
                <div className="py-4">{playerName}</div>
                <div className="grid grid-cols-10 grid-rows-20 border-l border-t border-white">
                    {grid.map((row, rowIndex) =>
                        row.map((cell, colIndex) => (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={`border-r border-b border-white w-8 h-8 ${cellColor[cell]}`}
                            />
                        )),
                    )}
                </div>
                <div className="flex flex-col border border-white w-full bg-gray-700 text-center">
                    <span>Score: {score}</span>
                    <span>Level: {level}</span>
                </div>
            </div>
        </>
    );
}

function OpponentGrid({
    opponentName,
    grid,
    score,
}: {
    opponentName: string;
    grid: GRID_STATES[][];
    score: number;
}) {
    const isPresent = opponentName !== "Empty";
    return (
        <>
            <div
                className={`flex flex-col items-center transition-opacity duration-300 ${
                    isPresent ? "opacity-100" : "opacity-30"
                }`}
            >
                <div className="py-2 text-sm">{opponentName}</div>
                <div className="grid grid-cols-10 grid-rows-20 border-l border-t border-white">
                    {grid.map((row, rowIndex) =>
                        row.map((cell, colIndex) => (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={`border-r border-b border-white w-4 h-4 ${cellColor[cell]}`}
                            />
                        )),
                    )}
                </div>
                <div className="border border-white w-full bg-gray-700 text-center">
                    Score: {score}
                </div>
            </div>
        </>
    );
}

interface GameOverState {
    active: boolean;
    level: number;
    ranking: GameOverRanking[];
}

function Game() {
    const navigate = useNavigate();
    const playerName = useSelector((state: RootState) => state.player.name);
    const gameGrids = useSelector((state: RootState) => state.game.grids);
    const myGrid = useSelector((state: RootState) => state.game.myGrid);
    const ownerId = useSelector((state: RootState) => state.game.ownerId);
    const gameStatus = useSelector((state: RootState) => state.game.status);

    const dispatch = useDispatch();

    const gameStartButton =
        ownerId === socket.id && gameStatus === GameStatus.WAITING;
    const [gameOverOverlay, setGameOverOverlay] = useState<GameOverState>({
        active: false,
        level: 0,
        ranking: [],
    });
    const levelRef = useRef(0);
    
    useAuthGuard();

    const initSockets = () => {
        socket.off(ServerMessage.ROOM_STATE);
        socket.off(ServerMessage.GAME_STATE);

        const grids: number[][][] = Array.from({ length: 5 }, () =>
            Array.from({ length: 20 }, (_, i) => Array(10).fill(0)),
        );

        socket.on(ServerMessage.ROOM_STATE, (payload) => {
            if (payload.gameInfo.status === GameStatus.WAITING) {
                const opponents: RoomPlayers[] = payload.players.filter(
                    (player: RoomPlayers) => player.name !== playerName,
                );

                const gridsState: PlayerGrid[] = Array.from(
                    { length: 4 },
                    (_, index) => ({
                        name: opponents[index]?.name || `Empty`,
                        score: 0,
                        board: grids[index],
                        isAlive: true,
                        level: 0,
                    }),
                );

                const myGrid: PlayerGrid = {
                    name: playerName,
                    score: 0,
                    board: grids[4],
                    isAlive: true,
                    level: 0,
                };

                dispatch(setMyGrid(myGrid));
                dispatch(setGrids(gridsState));
            }
            dispatch(setOwner(payload.players[0].socketId));
            dispatch(setStatus(payload.gameInfo.status));
        });

        socket.on(ServerMessage.GAME_STATE, (payload) => {
            const myGrid = payload.players.find(
                (grid: PlayerGrid) => grid.name === playerName,
            );
            const playerGrids = payload.players.filter(
                (grid: PlayerGrid) => grid.name !== playerName,
            );
            levelRef.current = myGrid.level;
            dispatch(setMyGrid(myGrid!));
            dispatch(setGrids(playerGrids));
        });

        socket.on(ServerMessage.GAME_OVER, (payload) => {
            setGameOverOverlay({
                active: true,
                level: levelRef.current,
                ranking: payload.ranking,
            });
        });
    };

    useEffect(() => {
        initSockets();
        return () => {
            socket.off(ServerMessage.ROOM_STATE);
            socket.off(ServerMessage.GAME_STATE);
            socket.off(ServerMessage.GAME_OVER);
            socket.emit(ClientMessage.LEAVE_ROOM);
            dispatch(setStatus(GameStatus.WAITING));
        };
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            switch (e.key) {
                case "ArrowLeft":
                    socket.emit("i", GameInput.LEFT);
                    break;
                case "ArrowRight":
                    socket.emit("i", GameInput.RIGHT);
                    break;
                case "ArrowDown":
                    socket.emit("i", GameInput.DOWN);
                    break;
                case "ArrowUp":
                    socket.emit("i", GameInput.ROTATE);
                    break;
                case " ":
                    socket.emit("i", GameInput.SPACE);
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const emptyGrid = Array.from({ length: 20 }, () => Array(10).fill(0));
    return (
        <>
            {gameStartButton && (
                <div className="pointer-events-none fixed inset-0 flex justify-center items-center z-50">
                    <button
                        className="pointer-events-auto bg-electric-red hover:bg-red-400 text-white font-bold text-2xl px-35 py-7 rounded-xl shadow-2xl transform hover:scale-105 transition-all animate-shadow-pulse2"
                        onClick={() => {
                            socket.emit(ClientMessage.START_GAME);
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
            {gameOverOverlay.active && (
                <div className="fixed inset-0 flex justify-center items-center z-51">
                    <div className="bg-gray-800/70 border-t border-b border-electric-red/50 px-30 py-15 rounded-xl backdrop-blur-sm">
                        {gameOverOverlay.ranking[0]?.name === playerName ? (
                            <div className="flex flex-col items-center">
                                <Crown
                                    className="w-7 h-7 text-amber-400 fill-amber-400 animate-pulse"
                                    strokeWidth={2}
                                />

                                <p className="text-xl font-medium text-amber-400 tracking-wide animate-pulse">
                                    Congratulations !
                                </p>
                                <p className="text-xl font-medium text-slate-300 tracking-wide">
                                    Score : {gameOverOverlay.ranking[0]?.points}
                                </p>
                                <p className="text-xl font-medium text-slate-300 tracking-wide">
                                    Level : {gameOverOverlay.level}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center animate-pulse">
                                <p className="text-xl font-medium text-red-500 tracking-wide">
                                    You lost...
                                </p>
                                <p className="text-xl font-medium text-slate-300 tracking-wide">
                                    Score :{" "}
                                    {
                                        gameOverOverlay.ranking.find(
                                            (val) => val.name === playerName,
                                        )?.points
                                    }
                                </p>
                                <p className="text-xl font-medium text-slate-300 tracking-wide">
                                    Level : {gameOverOverlay.level}
                                </p>
                            </div>
                        )}
                        <div className="flex flex-col justify-center">
                            <span className="mt-10 text-center text-xl">
                                Winner :{" "}
                                {gameOverOverlay.ranking[0].name ?? "Empty"}
                            </span>
                            <span className="text-center text-xl">
                                Score :{" "}
                                {gameOverOverlay.ranking[0].points ?? "0"}
                            </span>
                            <div className="mt-5 grid grid-cols-1 gap-2 w-full py-3">
                                {Array.from({ length: 4 }, (_, index) => (
                                    <div
                                        key={index}
                                        className="border rounded-xs flex justify-between px-4"
                                    >
                                        <span>
                                            {index + 2 + " - "}
                                            {gameOverOverlay.ranking[index + 1]
                                                ?.name ?? "Empty"}
                                        </span>
                                        <span>
                                            {gameOverOverlay.ranking[index + 1]
                                                ?.points ?? "0"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex justify-center items-center z-50">
                            <button
                                className="mt-10 pointer-events-auto bg-electric-red hover:bg-red-400 text-white font-bold text-xl px-8 py-4 rounded-xl shadow-2xl transform hover:scale-105 transition-all animate-shadow-pulse2"
                                onClick={() => {
                                    setGameOverOverlay((current) => ({
                                        ...current,
                                        active: false,
                                    }));
                                }}
                            >
                                <span className="animate-slow-pulse">
                                    Continue
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-center items-center pt-20 gap-40">
                <div className="flex flex-col gap-20">
                    <OpponentGrid
                        opponentName={gameGrids[0]?.name ?? "Empty"}
                        grid={gameGrids[0]?.board ?? emptyGrid}
                        score={gameGrids[0]?.score ?? 0}
                    ></OpponentGrid>
                    <OpponentGrid
                        opponentName={gameGrids[1]?.name ?? "Empty"}
                        grid={gameGrids[1]?.board ?? emptyGrid}
                        score={gameGrids[1]?.score ?? 0}
                    ></OpponentGrid>
                </div>
                <MainGrid
                    playerName={myGrid?.name}
                    grid={myGrid?.board ?? emptyGrid}
                    score={myGrid.score}
                    level={myGrid.level}
                ></MainGrid>
                <div className="flex flex-col gap-20">
                    <OpponentGrid
                        opponentName={gameGrids[2]?.name ?? "Empty"}
                        grid={gameGrids[2]?.board ?? emptyGrid}
                        score={gameGrids[2]?.score ?? 0}
                    ></OpponentGrid>
                    <OpponentGrid
                        opponentName={gameGrids[3]?.name ?? "Empty"}
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
