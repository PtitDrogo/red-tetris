import { GRID_STATES } from "../../../shared/types";
import { cellColor } from "./types";

type GridProps = {
    grid: GRID_STATES[][];
    length: number;
    height: number;
    cellSize: number;
};

function Grid({ grid, length, height, cellSize }: GridProps) {
    return (
        <div
            className={`grid grid-cols-${length} grid-rows-${height} border-l border-t border-white`}
        >
            {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                    <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`border-r border-b border-white w-${cellSize} h-${cellSize} ${cellColor[cell]}`}
                    />
                )),
            )}
        </div>
    );
}

export default Grid;
