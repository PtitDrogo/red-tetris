import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GameOverData, GameOverRanking, GameStatus, PieceType } from "../../../shared/types";

export interface PlayerGrid {
    name: string;
    id: string;
    score: number;
    board: number[][];
    isAlive: boolean;
    level: number;
    nextPiece?: PieceType;
    clearedLinesIndexes?: number[];
}

interface GameState {
    myGrid: PlayerGrid;
    grids: PlayerGrid[];
    ownerId: string;
    status: GameStatus;
    gameOver: {
        active: boolean;
        ranking: GameOverRanking[];
    };
}

const initialState: GameState = {
    myGrid: {
        name: "Empty",
        id: "Empty",
        score: 0,
        board: [],
        isAlive: true,
        level: 1,
        clearedLinesIndexes: [],
    },
    grids: [],
    ownerId: "None",
    status: GameStatus.WAITING,
    gameOver: {
        active: false,
        ranking: [],
    },
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
        setGameOver(
            state,
            action: PayloadAction<GameOverData>,
        ) {
            state.gameOver.active = true;
            state.gameOver.ranking = action.payload.ranking;
            state.status = GameStatus.WAITING;
        },
        clearGameOver(state) {
            state.gameOver.active = false;
            state.gameOver.ranking = [];
        },
    },
});

export const {
    setMyGrid,
    setGrids,
    setOwner,
    setStatus,
    setGameOver,
    clearGameOver,
} = gameSlice.actions;
export default gameSlice.reducer;
