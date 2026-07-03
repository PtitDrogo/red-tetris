import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Game from "./components/Game";
import Home from "./components/Home";
import LobbyList from "./components/LobbyList";
import { Title } from "./components/Title";

function TitleWrapper() {
    const { pathname } = useLocation();

    const isGame = pathname.split("/").length === 3;
    const isLobby = pathname === "/lobbylist";

    let wrapperClasses =
        "relative flex flex-col items-center w-full transition-all duration-500 ease-in-out whitespace-nowrap";

    if (isGame) {
        wrapperClasses += " h-0 -translate-y-68 scale-90 z-10";
    } else if (isLobby) {
        wrapperClasses += " pt-6";
    } else {
        wrapperClasses += " pt-75";
    }

    return (
        <div className={wrapperClasses}>
            <Title />
        </div>
    );
}

function App() {
    return (
        <div className="min-h-screen bg-gray-900 font-tetris text-white">
            <TitleWrapper />
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
