import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux";

const cellColor: Record<number, string> = {
    0: "",
    1: "bg-amber-300",
    2: "bg-red-400",
    3: "bg-blue-400",
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

    const gridMock = [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 2, 2, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 2, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 3, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ];

    return (
        <>
            <div className="flex justify-center items-center pt-20 gap-40">
                <div className="flex flex-col gap-20">
                    <OpponentGrid
                        opponentName="pablo"
                        grid={gridMock}
                    ></OpponentGrid>
                    <OpponentGrid
                        opponentName="pablo"
                        grid={gridMock}
                    ></OpponentGrid>
                </div>
                <MainGrid playerName={playerName} grid={gridMock}></MainGrid>
                <div className="flex flex-col gap-20">
                    <OpponentGrid
                        opponentName="pablo"
                        grid={gridMock}
                    ></OpponentGrid>
                    <OpponentGrid
                        opponentName="pablo"
                        grid={gridMock}
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
