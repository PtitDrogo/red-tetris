import { configureStore } from "@reduxjs/toolkit";
import playerReducer from "./playerSlice";
import lobbiesReducer from "./lobbiesSlice";

export const store = configureStore({
    reducer: {
        player: playerReducer,
        lobbies: lobbiesReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
