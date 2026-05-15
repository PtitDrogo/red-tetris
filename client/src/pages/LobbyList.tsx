import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux";
import { useState } from "react";

function LobbyList() {
    const navigate = useNavigate();
    const playerName = useSelector((state: RootState) => state.player.name);

    const [lobbies, setLobbies] = useState<string[]>([]);

    //Temporary
    const createLobby = () => {
        const id = lobbies.length + 1;
        const newLobby = `lobby - ${id}`;
        setLobbies([...lobbies, newLobby]);
    };

    return (
        <>
            <div className="flex flex-col items-center justify-start pt-15 gap-4">
                <div>Welcome {playerName}</div>
                <input
                    type="button"
                    className="border-2 border-black"
                    value="Create a lobby"
                    onClick={() => createLobby()}
                ></input>
                {lobbies.map((lobby, index) => (
                    <input
                        key={index}
                        type="button"
                        className="border-2 border-black"
                        value={lobby}
                        onClick={() => navigate("/game")}
                    ></input>
                ))}
            </div>
        </>
    );
}

export default LobbyList;
