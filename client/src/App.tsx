import { Route, Routes } from "react-router-dom";
import Game from "./pages/Game";
import Home from "./pages/Home";
import LobbyList from "./pages/LobbyList";
import TestGame from "./TestGame";
import { io } from "socket.io-client";


//This is temp, depending on when we decide to give a websocket connection to a user.
//Imo doing it on load is honestly not the worst idea ever.
const socket = io(import.meta.env.VITE_BACKEND_URL, {
    autoConnect: false,
    reconnection: false,
});


function App() {
    socket.on("connect", () => {
        console.log("Connected to backend with ID:", socket.id);
    });
    return (
        <>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/lobbylist" element={<LobbyList />} />
                <Route path="/game" element={<Game />} />
                <Route path="/test" element={<TestGame socket={socket} />} />
            </Routes>
        </>
    );
}

export default App;
