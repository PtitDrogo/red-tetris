import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { GameOverRanking, GameStatus, PieceType } from "../../../shared/types";

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
    gameOver: {
        active: boolean;
        level: number;
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
    },
    grids: [],
    ownerId: "None",
    status: GameStatus.WAITING,
    gameOver: {
        active: false,
        level: 0,
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
            action: PayloadAction<{
                level: number;
                ranking: GameOverRanking[];
            }>,
        ) {
            state.gameOver.active = true;
            state.gameOver.level = action.payload.level;
            state.gameOver.ranking = action.payload.ranking;
            state.status = GameStatus.WAITING;
        },
        clearGameOver(state) {
            state.gameOver.active = false;
            state.gameOver.level = 0;
            state.gameOver.ranking = [];
        },
    },
});

export const { setMyGrid, setGrids, setOwner, setStatus, setGameOver, clearGameOver } = gameSlice.actions;
export default gameSlice.reducer;
