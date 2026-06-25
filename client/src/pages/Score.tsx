import { GRID_STATES } from "../../../shared/types";
import { cellColor } from "./types";

type ScoreProps = {
    score: number;
    // level: string;//Add level later
};

export function Score({ score }: ScoreProps) {
    return (
        <div className="border border-white w-full bg-gray-700 text-center">
            Score: {score}
        </div>
    );
}
