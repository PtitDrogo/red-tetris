import { Navigate, Route, Routes } from "react-router-dom";
import Game from "./components/Game";
import Home from "./components/Home";
import LobbyList from "./components/LobbyList";

function App() {
    return (
        <div className="min-h-screen bg-gray-900 font-tetris text-white">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/lobbylist" element={<LobbyList />} />
                <Route path="/:roomName/:playerName" element={<Game />} />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </div>
    );
}

export default App;
