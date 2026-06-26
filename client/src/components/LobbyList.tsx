import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { LobbyState } from "../../../shared/types";
import { RootState } from "../redux";
import { setLobbies } from "../redux/lobbiesSlice";
import { socket } from "../socket";

import { ClientMessage, ServerMessage } from "../../../shared/types";
import { useAuthGuard } from "../hooks/useAuthGuard";

import { Crown } from "lucide-react";

function LobbyList() {
    const navigate = useNavigate();
    const playerName = useSelector((state: RootState) => state.player.name);
    const lobbies = useSelector((state: RootState) => state.lobbies.list);
    const dispatch = useDispatch();

    const createLobby = () => {
        dispatch({
            type: "socket/emit",
            payload: {
                event: ClientMessage.CREATE_ROOM,
                data: playerName,
            },
        });
    };

    const joinLobby = (id: string) => {
        dispatch({
            type: "socket/emit",
            payload: {
                event: ClientMessage.JOIN_ROOM,
                data: {
                    roomID: id,
                    playerName: playerName,
                },
            },
        });
    };

    useAuthGuard();

    useEffect(() => {
        // Pass the navigate function to the middleware
        dispatch({ type: "socket/initLobby", payload: { navigate } });

        return () => {
            dispatch({ type: "socket/cleanupLobby" });
        };
    }, [dispatch, navigate]);

    // useEffect(() => {
    //     socket.on(ServerMessage.ERROR, (payload) => {
    //         console.log(payload);
    //     });
    //     socket.off(ServerMessage.LOBBY_STATE);
    //     socket.on(ServerMessage.LOBBY_STATE, (payload: LobbyState[]) => {
    //         dispatch(setLobbies(payload));
    //     });
    //     socket.on(ServerMessage.JOIN_ROOM, (payload: string) =>
    //         navigate(`/${payload}/${playerName}`),
    //     );

    //     return () => {
    //         socket.off(ServerMessage.ERROR);
    //         socket.off(ServerMessage.LOBBY_STATE);
    //     };
    // }, []);

    return (
        <>
            <div className="flex flex-col items-center justify-start pt-15 gap-4">
                <div>Welcome {playerName}</div>
                <input
                    type="button"
                    className="px-5 pt-3 pb-3 rounded-xs bg-electric-red hover:bg-red-400 transition-all duration-300"
                    value="Create a lobby"
                    onClick={() => createLobby()}
                ></input>
                {lobbies.map((lobby, _) => (
                    <div key={lobby.id} className="w-96">
                        <button
                            type="button"
                            className="rounded-xl bg-gray-800 px-15 w-full hover:bg-gray-700 transition-all duration-300 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] animate-shadow-pulse transform hover:-translate-y-1 hover:scale-[1.03]"
                            onClick={() => joinLobby(lobby.id)}
                        >
                            <div className="mt-2 flex justify-center">
                                <span>{lobby.players[0] ?? "Empty"}</span>
                                <Crown
                                    className="w-5 h-5 text-amber-400 fill-amber-400 animate-pulse"
                                    strokeWidth={2}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-1 w-full py-3">
                                {Array.from({ length: 4 }, (_, index) => (
                                    <div
                                        key={index}
                                        className="border rounded-xs"
                                    >
                                        {lobby.players[index + 1] ?? "Empty"}
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
