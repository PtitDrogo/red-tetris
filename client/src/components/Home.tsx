import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setPlayerName } from "../redux/playerSlice";
import { Title } from "./Title";

const MAX_LEN_NAME = 12;

function Home() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [inputValue, setInputValue] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        dispatch({ type: "socket/initHome" });
        return () => {
            dispatch({ type: "socket/cleanupHome" });
        };
    }, [dispatch]);

    const handleStart = () => {
        if (inputValue.length < 3) {
            setError("Your name must contain at least 3 characters");
            return;
        }
        if (inputValue.length > MAX_LEN_NAME) {
            setError(
                `Your name must contain no more than ${MAX_LEN_NAME} characters`,
            );
            return;
        }

        if ([...inputValue].every((c) => c === " ")) {
            setError(`Your name cannot be just spaces`);
            return;
        }

        dispatch(setPlayerName(inputValue));
        dispatch({ type: "socket/connectPlayer", payload: { navigate } });
    };

    return (
        <>
            <div className="flex flex-col items-center justify-start">
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
                        className="rounded-xs bg-electric-red hover:bg-red-400 font-medium px-4 py-3 transform hover:scale-105 transition-all "
                    >
                        <span className="animate-slow-pulse">PLAY NOW!</span>
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
