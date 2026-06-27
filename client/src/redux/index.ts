import { configureStore } from "@reduxjs/toolkit";
import gameReducer from "./gameSlice";
import lobbiesReducer from "./lobbiesSlice";
import socketMiddleware from "./middleware/middleware";
import playerReducer from "./playerSlice";

export const store = configureStore({
    reducer: {
        player: playerReducer,
        lobbies: lobbiesReducer,
        game: gameReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ["socket/initLobby", "socket/connectPlayer"],
            },
        }).concat(socketMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
