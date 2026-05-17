import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux";
import { useState } from "react";
import { setLobbies } from "../redux/lobbiesSlice";
import type { LobbyState } from "../redux/lobbiesSlice";

function LobbyList() {
    const navigate = useNavigate();
    const playerName = useSelector((state: RootState) => state.player.name);
    const lobbies = useSelector((state: RootState) => state.lobbies.list);
    const dispatch = useDispatch();

    //Temporary
    const createLobby = () => {
        const id = lobbies.length + 1;
        const newId = `lobby - ${id}`;
        const newLobby: LobbyState = {
            name: newId,
            players: ["p1", "p2", "p3"],
        };
        dispatch(setLobbies([...lobbies, newLobby]));
    };

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
                {lobbies.map((lobby, index) => (
                    <div className="w-96">
                        <button
                            key={index}
                            type="button"
                            className="border-2 border-black px-15 w-full"
                            value={lobby.name}
                            onClick={() => navigate("/game")}
                        >
                            <div>{lobby.name}</div>
                            <div className="grid grid-cols-2 gap-1 w-full py-3">
                                {Array.from({ length: 4 }, (value, index) => (
                                    <div className="border-">
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
