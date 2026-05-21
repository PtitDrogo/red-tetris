import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux";
import { useEffect } from "react";
import { setLobbies } from "../redux/lobbiesSlice";
import type { LobbyState } from "../../../shared/types";
import { socket } from "../socket";

import { ClientMessage, ServerMessage } from "../../../shared/types";
import { useAuthGuard } from "../hooks/useAuthGuard";

function LobbyList() {
    const navigate = useNavigate();
    const playerName = useSelector((state: RootState) => state.player.name);
    const lobbies = useSelector((state: RootState) => state.lobbies.list);
    const dispatch = useDispatch();

    const createLobby = () => {
        socket.emit(ClientMessage.CREATE_ROOM, playerName);
    };

    useAuthGuard();

    useEffect(() => {
        socket.on(ServerMessage.LOBBY_STATE, (payload: LobbyState[]) => {
            dispatch(setLobbies(payload));
        });
        return () => {
            socket.off(ServerMessage.LOBBY_STATE);
        };
    }, []);

    return (
        <>
            <div className="flex flex-col items-center justify-start pt-15 gap-4">
                <div>Welcome {playerName}</div>
                <input
                    type="button"
                    className="border border-black px-3"
                    value="Create a lobby"
                    onClick={() => createLobby()}
                ></input>
                {lobbies.map((lobby, _) => (
                    <div key={lobby.name} className="w-96">
                        <button
                            type="button"
                            className="border-2 border-black px-15 w-full"
                            onClick={() => navigate("/game")}
                        >
                            <div>{lobby.name}</div>
                            <div className="grid grid-cols-2 gap-1 w-full py-3">
                                {Array.from({ length: 4 }, (_, index) => (
                                    <div key={index} className="border">
                                        {lobby.players[index] ?? "Empty"}
                                    </div>
                                ))}
                            </div>
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
}

export default LobbyList;
