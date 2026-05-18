import { Route, Routes } from "react-router-dom";
import { io } from "socket.io-client";
import Game from "./pages/Game";
import Home from "./pages/Home";
import LobbyList from "./pages/LobbyList";

function App() {
    //const socket = io("http://localhost:3000");

    // socket.on("connect", () => {
    //     console.log("Connected to backend with ID:", socket.id);
    // });
    return (
        <>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/lobbylist" element={<LobbyList />} />
                <Route path="/game" element={<Game />} />
            </Routes>
        </>
    );
}

export default App;
