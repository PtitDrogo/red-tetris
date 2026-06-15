import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { SocketRouter } from "./routers/SocketRouter.js";

const PORT = process.env.PORT || 3000;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: [
            "http://localhost:5173",
            "http://localhost:4173",
            "https://tetris-battles.vercel.app",
        ],
    }, //TODO: Put this in an env var later.
});

const socket = new SocketRouter(io);
socket.init();

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
