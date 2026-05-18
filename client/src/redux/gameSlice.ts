import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface gridState {
    player: string;
    grid: number[][];
}

interface gameState {
    myGrid: gridState;
    grids: gridState[];
}

const initialState: gameState = {
    myGrid: {player: "Empty", grid: []},
    grids: [],
};

const lobbiesSlice = createSlice({
    name: "game",
    initialState,
    reducers: {
        setMyGrid(state, action: PayloadAction<gridState>) {
            state.myGrid = action.payload;
        },
        setGrids(state, action: PayloadAction<gridState[]>) {
            state.grids = action.payload;
        },
    },
});

export const { setMyGrid , setGrids } = lobbiesSlice.actions;
export default lobbiesSlice.reducer;
