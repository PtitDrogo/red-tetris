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
    switch (action.type) {
        case "socket/emit": {
            const { event, data } = action.payload;
            socket.emit(event, data);
            break;
        }

        case "socket/cleanupLobby":
            socket.off(ServerMessage.ROOM_STATE);
            socket.off(ServerMessage.ERROR);
            socket.off(ServerMessage.LOBBY_STATE);
            socket.off(ServerMessage.JOIN_ROOM);
            break;

        case "socket/initLobby":
            initLobbies(store, action);
            break;

        case "socket/initGame":
            initGame(store);
            break;

        case "socket/cleanupGame":
            socket.off(ServerMessage.ROOM_STATE);
            socket.off(ServerMessage.GAME_STATE);
            socket.off(ServerMessage.GAME_OVER);
            socket.emit(ClientMessage.LEAVE_ROOM);
            break;

        case "socket/initHome":
            socket.disconnect();
            socket.off(ServerMessage.LOBBY_STATE);
            socket.on(ServerMessage.LOBBY_STATE, (payload: LobbyState[]) => {
                store.dispatch(setLobbies(payload));
            });
            break;

        case "socket/connectPlayer": {
            const { navigate } = action.payload;

            socket.off("connect");
            socket.on("connect", () => {
                navigate("/lobbylist");
                socket.off("connect");
            });

            socket.connect();
            // socket.off("disconnect");

            // socket.on("disconnect", () => {
            //     store.dispatch(setPlayerName(""));
            // });
            break;
        }

        case "socket/cleanupHome":
            socket.off(ServerMessage.LOBBY_STATE);
            socket.off("connect");
            break;

        default:
            break;
    }

    return next(action);
};

export default socketMiddleware;
