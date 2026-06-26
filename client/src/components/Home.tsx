import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux";
import { useState, useEffect } from "react";
import { setPlayerName } from "../redux/playerSlice";
import { setLobbies } from "../redux/lobbiesSlice";
import { socket } from "../socket";
import { LobbyState, ServerMessage } from "../../../shared/types";

const MAX_LEN_NAME = 12

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
        if (inputValue.length > MAX_LEN_NAME) {
            setError(`Your name must contain no more than ${MAX_LEN_NAME} characters`);
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
                <h1 className="text-5xl md:text-7xl font-black tracking-widest text-electric-red uppercase mb-16 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]">
                    Red <span className="text-white">Tetris</span>
                </h1>
                <h1 className="px-2 py-3">Enter your name</h1>
                <div className="flex flex-col gap-2">
                    <input
                        type="text"
                        className="bg-gray-800 rounded-xs px-3 py-3 hover:bg-gray-700 focus:outline-none focus:bg-gray-700 text-center transition-colors"
                        value={inputValue}
                        maxLength={MAX_LEN_NAME}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleStart();
                        }}
                    ></input>
                    <button
                        type="button"
                        onClick={() => handleStart()}
                        className="rounded-xs bg-electric-red hover:bg-red-400 font-medium px-4 py-3 transition-colors"
                    >
                        PLAY NOW!
                    </button>
                </div>
                {error && (
                    <p className="text-red-500 text-sm py-5">
                        Invalid: {error}
                    </p>
                )}
            </div>
        </>
    );
}

export default Home;
