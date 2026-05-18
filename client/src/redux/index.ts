import { configureStore } from "@reduxjs/toolkit";
import playerReducer from "./playerSlice";
import lobbiesReducer from "./lobbiesSlice";
import gameReducer from "./gameSlice";

export const store = configureStore({
    reducer: {
        player: playerReducer,
        lobbies: lobbiesReducer,
        game: gameReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
