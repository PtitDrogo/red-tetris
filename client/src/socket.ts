import { io } from "socket.io-client";

export let socket = io(import.meta.env.VITE_BACKEND_URL ?? "http://localhost:3000", {
    autoConnect: false,
    reconnection: false,
});
