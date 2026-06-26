import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux";
import { useState, useEffect } from "react";
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
    GameStatus,
    GRID_STATES,
    PieceType,
    RoomPlayers,
    ServerMessage,
} from "../../../shared/types";
import Grid from "./Grid";
import { Score } from "./Score";
import { PiecePreview } from "./Piece";

type gridProps = {
    playerName: string;
    grid: GRID_STATES[][];
    score: number;
    level?: number;
    nextPiece?: PieceType;
};

function MainGrid({ playerName, grid, score, nextPiece }: gridProps) {
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
                <Score score={score} />
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
    const dispatch = useDispatch();
    const [gameStartButton, setGameStartButton] = useState(false);

    useAuthGuard();

    const initGame = () => {
        socket.off(ServerMessage.ROOM_STATE);
        socket.off(ServerMessage.GAME_STATE);

        const grids: number[][][] = Array.from({ length: 5 }, () =>
            Array.from({ length: 20 }, (_, i) => Array(10).fill(0)),
        );

        socket.on(ServerMessage.ROOM_STATE, (payload) => {
            const opponents: RoomPlayers[] = payload.players.filter(
                (player: RoomPlayers) => player.socketId !== socket.id,
            );

            const gridsState: PlayerGrid[] = Array.from(
                { length: 4 },
                (_, index) => ({
                    name: opponents[index]?.name || "Empty",
                    id: opponents[index]?.socketId || "Empty",
                    score: 0,
                    board: grids[index],
                    isAlive: true,
                    level: 0,
                }),
            );

            const myGrid: PlayerGrid = {
                name: playerName,
                id: socket.id || "Empty",
                score: 0,
                board: grids[4],
                isAlive: true,
                level: 0,
            };

            dispatch(setMyGrid(myGrid));
            dispatch(setGrids(gridsState));
            dispatch(setOwner(payload.players[0].socketId));
            dispatch(setStatus(payload.gameInfo.status));

            //I have to check against the payload the const ts variables seems to be stale.
            if (
                payload.players[0].socketId === socket.id &&
                payload.gameInfo.status === GameStatus.WAITING
            )
                setGameStartButton(true);
        });

        socket.on(ServerMessage.GAME_STATE, (payload) => {
            const myGrid = payload.players.find(
                (grid: PlayerGrid) => grid.id === socket.id,
            );
            const playerGrids = payload.players.filter(
                (grid: PlayerGrid) => grid.id !== socket.id,
            );
            dispatch(setMyGrid(myGrid!));
            dispatch(setGrids(playerGrids));
        });

        if (ownerId === socket.id && gameStatus === GameStatus.WAITING)
            setGameStartButton(true);
    };

    useEffect(() => {
        initGame();
        return () => {
            socket.off(ServerMessage.ROOM_STATE);
            socket.off(ServerMessage.GAME_STATE);
        };
    }, []);

    useEffect(() => {
        if (ownerId === socket.id && gameStatus === GameStatus.WAITING)
            setGameStartButton(true);
        else setGameStartButton(false);
    }, [ownerId]);

    useEffect(() => {
        socket.on(ServerMessage.GAME_OVER, (payload) => {
            initGame();
        });
        return () => {
            socket.off(ServerMessage.GAME_OVER);
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
                    if (e.repeat) return;
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
            dispatch(setStatus(GameStatus.WAITING));
        };
    }, []);

    const handleGameStart = () => {
        setGameStartButton(false);
        socket.off(ServerMessage.ROOM_STATE);
        socket.on(ServerMessage.ROOM_STATE, (payload) => {
            dispatch(setOwner(payload.players[0].socketId));
            dispatch(setStatus(payload.gameInfo.status));
        });
        socket.emit(ClientMessage.START_GAME);
    };

    const emptyGrid = Array.from({ length: 20 }, () => Array(10).fill(0));
    return (
        <>
            {gameStartButton && (
                <div className="fixed inset-0 flex justify-center items-center z-50 pointer-events-none">
                    <button
                        className="pointer-events-auto bg-electric-red hover:bg-red-400 text-white font-bold text-2xl px-8 py-4 rounded-xl shadow-2xl transform hover:scale-105 transition-all animate-shadow-pulse2"
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
