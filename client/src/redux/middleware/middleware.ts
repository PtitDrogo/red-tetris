import { Middleware } from "@reduxjs/toolkit";
import { ClientMessage, ServerMessage } from "../../../../shared/types";
import { socket } from "../../socket"; 
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

    return next(action);
};

export default socketMiddleware;
