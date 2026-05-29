import { io } from "socket.io-client";

export let socket = io("http://localhost:3000", {
    autoConnect: false,
    reconnection: false,
});
