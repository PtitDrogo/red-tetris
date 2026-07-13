import { GRID_STATES } from "../../../shared/types";
import { cellColor } from "./types";

type GridProps = {
  grid: GRID_STATES[][];
  gridColsClass: string;
  gridRowsClass: string;
  cellSizeClass: string;
};

function Grid({
  grid,
  gridColsClass,
  gridRowsClass,
  cellSizeClass,
}: GridProps) {
  return (
    <div
      className={`grid ${gridColsClass} ${gridRowsClass} border-l border-t border-white/50 select-none cursor-default`}
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
