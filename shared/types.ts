export type TestType = {
    test: number;
    testString: string;
};

//Im not exactly optimizing everything, but we might as well not send too much data.
export enum ClientMessage {
    CREATE_ROOM = "c",
    JOIN_ROOM = "j",
    LEAVE_ROOM = "l",
    START_GAME = "s",
    PLAYER_INPUT = "i",
}

export enum ServerMessage {
    GAME_STATE = "gs",
    LOBBY_STATE = "ls", //all rooms
    ROOM_STATE = "rs", // all players.
}

export type Room = {
    id: string; //This is lowkey the ID.
    players: LobbyPlayers[];
    game: Game; //not 100% sure about this
};

export type Game = {
    status: GameStatus;
};

export enum GameStatus {
    WAITING = "Waiting",
    ONGOING = "Ongoing",
    OVER = "Over",
}

export type LobbyPlayers = {
    name: string;
    socketId: string;
    //Maybe more stuff idk, so far this is frontend stuff, only the frontend might care about this.
};
