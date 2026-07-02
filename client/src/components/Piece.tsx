import { useSelector } from "react-redux";
import { PREVIEW_PIVOT } from "../../../shared/constants";
import { GRID_STATES, PieceType, Shapes } from "../../../shared/types";
import { RootState } from "../redux";
import { InfoTooltip } from "./ToolTip";
import { cellColor } from "./types";

type PieceProps = {
    type?: PieceType;
};

export function PiecePreview({ type }: PieceProps) {
    const grid: GRID_STATES[][] = Array.from({ length: 3 }, (_, i) =>
        Array(4).fill(GRID_STATES.EMPTY),
    );
    const playWithBlessed = useSelector(
        (state: RootState) => state.game.playWithBlessed,
    );

    let shapeData = Shapes[playWithBlessed ? PieceType.B : PieceType.N];
    if (type) shapeData = Shapes[type];
    shapeData.cells.forEach((c) => {
        grid[c.y + PREVIEW_PIVOT.y][c.x + PREVIEW_PIVOT.x] = shapeData.color;
    });

    return (
        <>
            {playWithBlessed && (
                <InfoTooltip message="Clear 2 lines or more to get blessed pieces! Bigger clears equals more pieces." />
            )}
            <p>Next: </p>
            <div className={`grid grid-cols-4 grid-rows-3`}>
                {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className={`w-4 h-4 ${cellColor[cell]}`}
                        />
                    )),
                )}
            </div>
        </>
    );
}
