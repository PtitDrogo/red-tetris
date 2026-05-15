import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../redux";
import { setPlayerName } from "../redux/playerSlice";
import { useState } from "react";

function Home() {
    const navigate = useNavigate();
    const playerName = useSelector((state: RootState) => state.player.name);
    const dispatch = useDispatch();

    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState("");

    const handleStart = () => {
        if (inputValue.length < 3){
            setError("Your name must contain at least 3 characters")
            return;
        }
        dispatch(setPlayerName(inputValue));
        navigate("/lobbylist");
    };

    return (
        <>
            <div className="flex flex-col items-center justify-start pt-75">
                <h1 className="px-2 py-3">Enter your name</h1>
                <div className="flex flex-row gap-2">
                    <input
                        type="text"
                        className="border-2 border-black px-3 py-3"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleStart();
                        }}
                    ></input>
                </div>
                {error && <p className="text-red-500 text-sm">Invalid: {error}</p>}
            </div>
        </>
    );
}

export default Home;
