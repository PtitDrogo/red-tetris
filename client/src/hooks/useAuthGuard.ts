import { useEffect } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux";
import { useNavigate } from "react-router-dom";
import { socket } from "../socket";

export function useAuthGuard() {
    const navigate = useNavigate();
    const playerName = useSelector((state: RootState) => state.player.name);

    useEffect(() => {
        if (!playerName) navigate("/");
        socket.on("disconnect", () => navigate("/"));
    }, [playerName]);
}
