import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { RootState } from "../redux";

export function useAuthGuard() {
    const navigate = useNavigate();
    const playerName = useSelector((state: RootState) => state.player.name);

    useEffect(() => {
        if (!playerName) {
            navigate("/");
        }
    }, [playerName, navigate]);
}
