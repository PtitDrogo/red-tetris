import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GameStatus, PieceType } from "../../../shared/types";

export interface PlayerGrid {
    name: string;
    id: string;
    score: number;
    board: number[][];
    isAlive: boolean;
    level: number;
    nextPiece?: PieceType;
}

interface GameState {
    myGrid: PlayerGrid;
    grids: PlayerGrid[];
    ownerId: string;
    status: GameStatus;
}

const initialState: GameState = {
    myGrid: {
        name: "Empty",
        id: "Empty",
        score: 0,
        board: [],
        isAlive: true,
        level: 1,
    },
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
        },
        // setGameOver: (state, action: PayloadAction<GameOver>) => {
        //     state.gameOver.active = true;
        //     state.gameOver.ranking = action.payload; // Saves the server's ranking list
        // },
    },
});

export const { setMyGrid, setGrids, setOwner, setStatus } = gameSlice.actions;
export default gameSlice.reducer;
