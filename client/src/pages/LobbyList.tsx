import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux";
import { useEffect } from "react";
import { setLobbies } from "../redux/lobbiesSlice";
import type { LobbyState, RoomPlayers } from "../../../shared/types";
import { socket } from "../socket";

import { ClientMessage, ServerMessage } from "../../../shared/types";
import { useAuthGuard } from "../hooks/useAuthGuard";
import { PlayerGrid, setGrids, setMyGrid, setOwner } from "../redux/gameSlice";

function LobbyList() {
    const navigate = useNavigate();
    const playerName = useSelector((state: RootState) => state.player.name);
    const lobbies = useSelector((state: RootState) => state.lobbies.list);
    const dispatch = useDispatch();

    const createLobby = () => {
        socket.emit(ClientMessage.CREATE_ROOM, playerName);
    };

    const joinLobby = (id: string) => {
        socket.emit(ClientMessage.JOIN_ROOM, {
            roomID: id,
            playerName: playerName,
        });
    };

    useAuthGuard();

    useEffect(() => {
        const grids: number[][][] = Array.from({ length: 5 }, (_, index) =>
            Array.from({ length: 20 }, (_, i) => Array(10).fill(index + 1)),
        );

        socket.on(ServerMessage.ROOM_STATE, (payload) => {
            const opponents: RoomPlayers[] = payload.players.filter(
                (player: RoomPlayers) => player.name !== playerName,
            );

            const gridsState: PlayerGrid[] = Array.from(
                { length: 4 },
                (_, index) => ({
                    name: opponents[index]?.name || `player${index + 1}`,
                    score: 0,
                    board: grids[index],
                    isAlive: true,
                    level: 0,
                }),
            );

            const myGrid: PlayerGrid = {
                name: playerName,
                score: 0,
                board: grids[4],
                isAlive: true,
                level: 0,
            };

            dispatch(setMyGrid(myGrid));
            dispatch(setGrids(gridsState));
            dispatch(setOwner(payload.players[0].socketId));
        });

        return () => {
            socket.off(ServerMessage.ROOM_STATE);
        };
    }, []);

    useEffect(() => {
        //temp
        socket.on(ServerMessage.ERROR, (payload) => {
            console.log(payload);
        });
        socket.off(ServerMessage.LOBBY_STATE);
        socket.on(ServerMessage.LOBBY_STATE, (payload: LobbyState[]) => {
            dispatch(setLobbies(payload));
        });
        socket.on(ServerMessage.JOIN_ROOM, (payload: string) =>
            navigate(`/${payload}/${playerName}`),
        );

        return () => {
            socket.off(ServerMessage.ERROR);

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
                    <div key={lobby.id} className="w-96">
                        <button
                            type="button"
                            className="border-2 border-black px-15 w-full"
                            onClick={() => joinLobby(lobby.id)}
                        >
                            <div>{lobby.id}</div>
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
