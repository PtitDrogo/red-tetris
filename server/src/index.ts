import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { SocketRouter } from "./routers/SocketRouter.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: ["http://localhost:5173", "http://localhost:4173"] }, //TODO: Put this in an env var later.
});

const socket = new SocketRouter(io);
socket.init();

httpServer.listen(3000, () => {
    console.log("Server running on port 3000");
});
