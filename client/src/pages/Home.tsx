import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux";
import { useState, useEffect } from "react";
import { setPlayerName } from "../redux/playerSlice";
import { setLobbies } from "../redux/lobbiesSlice";
import { socket } from "../socket";
import { LobbyState, ServerMessage } from "../../../shared/types";

function Home() {
    const navigate = useNavigate();
    const playerName = useSelector((state: RootState) => state.player.name);
    const dispatch = useDispatch();

    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        socket.disconnect();
    }, []);

    const handleStart = () => {
        if (inputValue.length < 3) {
            setError("Your name must contain at least 3 characters");
            return;
        }
        dispatch(setPlayerName(inputValue));
        socket.off("connect");
        socket.on("connect", () => {
            navigate("/lobbylist");
            socket.off("connect");
        });
        socket.connect();
    };

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
            <div className="flex flex-col items-center justify-start pt-75">
                <h1 className="px-2 py-3">Enter your name</h1>
                <div className="flex flex-col gap-2">
                    <input
                        type="text"
                        className="border border-black px-3 py-3"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleStart();
                        }}
                    ></input>
                    {/* Added Go to Test Button */}
                    <button
                        type="button"
                        onClick={() => navigate("/test")}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-medium px-4 py-3 border border-blue-500 transition-colors"
                    >
                        CLIQUE ICI POUR JOUEUR
                    </button>
                </div>
                {error && (
                    <p className="text-red-500 text-sm">Invalid: {error}</p>
                )}
            </div>
        </>
    );
}

export default Home;
