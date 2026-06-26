import { GRID_STATES } from "../../../shared/types";
import { cellColor } from "./types";

type GridProps = {
    grid: GRID_STATES[][];
    gridColsClass: `grid-cols-${number}`;
    gridRowsClass: `grid-rows-${number}`;
    cellSizeClass: `w-${number} h-${number}`;
};

function Grid({
    grid,
    gridColsClass,
    gridRowsClass,
    cellSizeClass,
}: GridProps) {
    return (
        <div
            className={`grid ${gridColsClass} ${gridRowsClass} border-l border-t border-white/50`}
        >
            {grid.map((row, rowIndex) =>
                row.map((cell, colIndex) => (
                    <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`border-r border-b border-white/50 ${cellSizeClass} ${cellColor[cell]}`}
                    />
                )),
            )}
        </div>
    );
}

export default Grid;
