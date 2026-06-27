import { Middleware } from "@reduxjs/toolkit";
import {
    ClientMessage,
    LobbyState,
    ServerMessage,
} from "../../../../shared/types";
import { socket } from "../../socket";
import { setLobbies } from "../lobbiesSlice";
import { setPlayerName } from "../playerSlice";
import { initGame, initLobbies } from "./initializers";

const socketMiddleware: Middleware = (store) => (next) => (action: any) => {
    if (action.type === "socket/emit") {
        const { event, data } = action.payload;
        socket.emit(event, data);
    }

    if (action.type === "socket/cleanupLobby") {
        socket.off(ServerMessage.ROOM_STATE);
        socket.off(ServerMessage.ERROR);
        socket.off(ServerMessage.LOBBY_STATE);
        socket.off(ServerMessage.JOIN_ROOM);
    }

    if (action.type === "socket/initLobby") {
        initLobbies(store, action);
    }

    if (action.type === "socket/initGame") {
        initGame(store);
    }

    if (action.type === "socket/cleanupGame") {
        socket.off(ServerMessage.ROOM_STATE);
        socket.off(ServerMessage.GAME_STATE);
        socket.off(ServerMessage.GAME_OVER);
        socket.emit(ClientMessage.LEAVE_ROOM);
    }

    if (action.type === "socket/initHome") {
        socket.disconnect();

        socket.off(ServerMessage.LOBBY_STATE);
        socket.on(ServerMessage.LOBBY_STATE, (payload: LobbyState[]) => {
            store.dispatch(setLobbies(payload));
        });
    }

    if (action.type === "socket/connectPlayer") {
        const { navigate } = action.payload;

        socket.off("connect");
        socket.on("connect", () => {
            navigate("/lobbylist");
            socket.off("connect");
        });

        socket.connect();
        socket.off("disconnect");

        socket.on("disconnect", () => {
            store.dispatch(setPlayerName(""));
        });
    }

    if (action.type === "socket/cleanupHome") {
        socket.off(ServerMessage.LOBBY_STATE);
        socket.off("connect");
    }

    return next(action);
};

export default socketMiddleware;
