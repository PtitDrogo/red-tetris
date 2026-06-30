import { GRID_STATES } from "../../../shared/types";

export const cellColor: Record<GRID_STATES, string> = {
    [GRID_STATES.EMPTY]: "",
    [GRID_STATES.RED]: "bg-red-500",
    [GRID_STATES.BLUE]: "bg-blue-600",
    [GRID_STATES.GREEN]: "bg-green-500",
    [GRID_STATES.ORANGE]: "bg-orange-500",
    [GRID_STATES.CYAN]: "bg-cyan-400",
    [GRID_STATES.PURPLE]: "bg-purple-700",
    [GRID_STATES.YELLOW]: "bg-yellow-300",
    [GRID_STATES.BLESSED]:
        "bg-yellow-300 animate-pulse shadow-[0_0_10px_3px_rgba(253,224,71,0.8)]",

    [GRID_STATES.GHOST]: "bg-white/20 backdrop-blur-sm",
    [GRID_STATES.BLOCKED]: "bg-electric-red animate-generate",
    [GRID_STATES.FULL]: "bg-white shadow-[0_0_15px_5px_rgba(255,255,255,0.9)]",
};
