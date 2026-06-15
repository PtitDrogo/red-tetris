import { DefaultEventsMap, Socket } from "socket.io";

export type SocketType = Socket<
    DefaultEventsMap,
    DefaultEventsMap,
    DefaultEventsMap,
    any
>;

