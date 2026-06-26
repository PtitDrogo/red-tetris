import { Navigate, Route, Routes } from "react-router-dom";
import Game from "./components/Game";
import Home from "./components/Home";
import LobbyList from "./components/LobbyList";
import TestGame from "./TestGame";
import { io } from "socket.io-client";

//This is temp, depending on when we decide to give a websocket connection to a user.
//Imo doing it on load is honestly not the worst idea ever. lalala
const socket = io(import.meta.env.VITE_BACKEND_URL, {
    autoConnect: true,
    reconnection: false,
});

socket.on("connect", () => {
    console.log("Connected to backend with ID:", socket.id);
});

function App() {
    return (
        <div className="min-h-screen bg-gray-900 font-tetris text-white">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/lobbylist" element={<LobbyList />} />
                <Route path="/:roomName/:playerName" element={<Game />} />
                <Route path="/test" element={<TestGame socket={socket} />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default App;
