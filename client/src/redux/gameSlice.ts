import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GameStatus } from "../../../shared/types";

export interface PlayerGrid {
    name: string;
    score: number;
    board: number[][];
    isAlive: boolean;
    level: number;
    nextPiece?: string;
}

interface GameState {
    myGrid: PlayerGrid;
    grids: PlayerGrid[];
    ownerId: string;
    status: GameStatus;
}

const initialState: GameState = {
    myGrid: { name: "Empty", score: 0, board: [], isAlive: true, level: 1 },
    grids: [],
    ownerId: "None",
    status: GameStatus.WAITING,
};

const gameSlice = createSlice({
    name: "game",
    initialState,
    reducers: {
        setMyGrid(state, action: PayloadAction<PlayerGrid>) {
            state.myGrid = action.payload;
        },
        setGrids(state, action: PayloadAction<PlayerGrid[]>) {
            state.grids = action.payload;
        },
        setOwner(state, action: PayloadAction<string>) {
            state.ownerId = action.payload;
        },
        setStatus(state, action: PayloadAction<GameStatus>) {
            state.status = action.payload;
        }
    },
});

export const { setMyGrid, setGrids, setOwner, setStatus } = gameSlice.actions;
export default gameSlice.reducer;
