import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface PlayerGrid {
    name: string;
    score: number;
    board: number[][];
    isAlive: boolean;
    level: number;
}

interface GameState {
    myGrid: PlayerGrid;
    grids: PlayerGrid[];
}

const initialState: GameState = {
    myGrid: { name: "Empty", score: 0, board: [], isAlive: true, level: 1 },
    grids: [],
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
        }
    },
});

export const { setMyGrid, setGrids } = gameSlice.actions;
export default gameSlice.reducer;