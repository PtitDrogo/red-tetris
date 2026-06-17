import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux";
import { useState, useEffect } from "react";
import { socket } from "../socket";

import { setGrids, setMyGrid, type PlayerGrid } from "../redux/gameSlice";
import { useAuthGuard } from "../hooks/useAuthGuard";
import {
    ClientMessage,
    GameInput,
    GRID_STATES,
    RoomPlayers,
    ServerMessage,
} from "../../../shared/types";

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
}: {
    playerName: string;
    grid: GRID_STATES[][];
}) {
    return (
        <>
            <div className="flex flex-col items-center">
                <div className="py-4">{playerName}</div>
                <div className="grid grid-cols-10 grid-rows-20 border-l border-t border-black">
                    {grid.map((row, rowIndex) =>
                        row.map((cell, colIndex) => (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={`border-r border-b border-black w-8 h-8 ${cellColor[cell]}`}
                            />
                        )),
                    )}
                </div>
            </div>
        </>
    );
}

function OpponentGrid({
    opponentName,
    grid,
}: {
    opponentName: string;
    grid: GRID_STATES[][];
}) {
    return (
        <>
            <div className="flex flex-col items-center">
                <div className="py-2 text-sm">{opponentName}</div>
                <div className="grid grid-cols-10 grid-rows-20 border-l border-t border-gray-700">
                    {grid.map((row, rowIndex) =>
                        row.map((cell, colIndex) => (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={`border-r border-b border-gray-700 w-4 h-4 ${cellColor[cell]}`}
                            />
                        )),
                    )}
                </div>
            </div>
        </>
    );
}

function Game() {
    const navigate = useNavigate();
    const playerName = useSelector((state: RootState) => state.player.name);
    const gameGrids = useSelector((state: RootState) => state.game.grids);
    const myGrid = useSelector((state: RootState) => state.game.myGrid);
    const dispatch = useDispatch();
    const [gameStartButton, setGameStartButton] = useState(1);

    useAuthGuard();

    useEffect(() => {
        const grids: number[][][] = Array.from({ length: 5 }, (_, index) =>
            Array.from({ length: 20 }, (_, i) => Array(10).fill(index + 1)),
        );

        socket.on(ServerMessage.ROOM_STATE, (payload) => {
            const opponents: RoomPlayers[] = payload.players.filter(
                (player: RoomPlayers) => player.name !== playerName,
            );

            const gridsState: PlayerGrid[] = Array.from(
                { length: 4 },
                (_, index) => ({
                    name: opponents[index]?.name || `player${index + 1}`,
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
        });

        socket.on(ServerMessage.GAME_STATE, (payload) => {
            const myGrid = payload.players.find(
                (grid: PlayerGrid) => grid.name === playerName,
            );
            const playerGrids = payload.players.filter(
                (grid: PlayerGrid) => grid.name !== playerName,
            );
            dispatch(setMyGrid(myGrid!));
            dispatch(setGrids(playerGrids));
        });

        return () => {
            socket.off(ServerMessage.ROOM_STATE);
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

    useEffect(() => {
        return () => {
            socket.emit(ClientMessage.LEAVE_ROOM);
        };
    }, []);

    const handleGameStart = () => {
        setGameStartButton(0);
        socket.off(ServerMessage.ROOM_STATE);
        socket.emit(ClientMessage.START_GAME);
    };

    const emptyGrid = Array.from({ length: 20 }, () => Array(10).fill(0));
    return (
        <>
            {gameStartButton && (
                <div className="fixed inset-0 flex justify-center items-center z-50 pointer-events-none">
                    <button
                        className="pointer-events-auto bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-2xl px-8 py-4 rounded-lg shadow-2xl border-2 border-white transform hover:scale-105 transition-all"
                        onClick={() => {
                            handleGameStart();
                        }}
                    >
                        START
                    </button>
                </div>
            )}
            <div className="flex justify-center items-center pt-20 gap-40">
                <div className="flex flex-col gap-20">
                    <OpponentGrid
                        opponentName={gameGrids[0]?.name ?? "Empty"}
                        grid={gameGrids[0]?.board ?? emptyGrid}
                    ></OpponentGrid>
                    <OpponentGrid
                        opponentName={gameGrids[1]?.name ?? "Empty"}
                        grid={gameGrids[1]?.board ?? emptyGrid}
                    ></OpponentGrid>
                </div>
                <MainGrid
                    playerName={myGrid?.name}
                    grid={myGrid?.board ?? emptyGrid}
                ></MainGrid>
                <div className="flex flex-col gap-20">
                    <OpponentGrid
                        opponentName={gameGrids[2]?.name ?? "Empty"}
                        grid={gameGrids[2]?.board ?? emptyGrid}
                    ></OpponentGrid>
                    <OpponentGrid
                        opponentName={gameGrids[3]?.name ?? "Empty"}
                        grid={gameGrids[3]?.board ?? emptyGrid}
                    ></OpponentGrid>
                </div>
            </div>
            <div className="fixed bottom-4 right-4">
                <input
                    type="button"
                    className="border border-black px-3"
                    value="Quit"
                    onClick={() => navigate("/lobbylist")}
                ></input>
            </div>
        </>
    );
}

export default Game;
