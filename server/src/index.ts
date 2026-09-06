import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { SocketRouter } from "./routers/SocketRouter.js";

const PORT = process.env.PORT || 3000;
const ORIGIN = process.env.CLIENT_ORIGIN;
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: [
            "http://localhost:5173",
            "http://localhost:4173",
            "https://tetris-battles.vercel.app",
            "https://ptitdrogo.com",
            "https://www.tetris.ptitdrogo.com",
            "https://tetris.ptitdrogo.com",
            ORIGIN ?? "",
        ],
    },
});

const socket = new SocketRouter(io);
socket.init();

httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
