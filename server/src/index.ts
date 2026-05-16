import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { SocketRouter } from "./routers/SocketRouter";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "http://localhost:5173" }, //We need this because otherwise CORS will block requests from frontend server.
});

const socket = new SocketRouter(io);
socket.init();

httpServer.listen(3000, () => {
    console.log("Server running on port 3000");
});
