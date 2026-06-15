import { io } from "socket.io-client";

export let socket = io(import.meta.env.VITE_BACKEND_URL, {
    autoConnect: false,
    reconnection: false,
});
