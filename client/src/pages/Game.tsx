import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux";
import { useState, useEffect } from "react";
import { socket } from "../socket";

import { setGrids, setMyGrid, type gridState } from "../redux/gameSlice";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { ServerMessage } from "../../../shared/types";

const cellColor: Record<number, string> = {
    0: "",
    1: "bg-amber-300",
    2: "bg-red-400",
    3: "bg-blue-400",
    4: "bg-green-300",
    5: "bg-cyan-300",
};

function MainGrid({
    playerName,
    grid,
}: {
    playerName: string;
    grid: number[][];
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
    grid: number[][];
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

    useAuthGuard();

    //temp
    useEffect(() => {
        const grids = Array.from({ length: 5 }, (_, index) =>
            Array.from({ length: 20 }, (_, i) => Array(10).fill(index + 1)),
        );

        const gridsState: gridState[] = Array.from(
            { length: 4 },
            (_, index) => ({
                player: `player${index + 1}`,
                grid: grids[index],
            }),
        );
        const myGrid: gridState = { player: playerName, grid: grids[4] };
        dispatch(setGrids(gridsState));
        dispatch(setMyGrid(myGrid));
    }, []);

    useEffect(() => {
        return () => {
            socket.emit(ServerMessage.LEAVE_ROOM);
        };
    });

    const emptyGrid = Array.from({ length: 20 }, () => Array(10).fill(0));
    return (
        <>
            <div className="flex justify-center items-center pt-20 gap-40">
                <div className="flex flex-col gap-20">
                    <OpponentGrid
                        opponentName={gameGrids[0]?.player ?? "Empty"}
                        grid={gameGrids[0]?.grid ?? emptyGrid}
                    ></OpponentGrid>
                    <OpponentGrid
                        opponentName={gameGrids[1]?.player ?? "Empty"}
                        grid={gameGrids[1]?.grid ?? emptyGrid}
                    ></OpponentGrid>
                </div>
                <MainGrid
                    playerName={myGrid?.player}
                    grid={myGrid?.grid ?? emptyGrid}
                ></MainGrid>
                <div className="flex flex-col gap-20">
                    <OpponentGrid
                        opponentName={gameGrids[2]?.player ?? "Empty"}
                        grid={gameGrids[2]?.grid ?? emptyGrid}
                    ></OpponentGrid>
                    <OpponentGrid
                        opponentName={gameGrids[3]?.player ?? "Empty"}
                        grid={gameGrids[3]?.grid ?? emptyGrid}
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
