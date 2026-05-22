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

export enum GameInput {
    LEFT = 0,
    RIGHT = 1,
    DOWN = 2,
    SPACE = 3,
    ROTATE = 4,
}

export enum ServerMessage {
    GAME_STATE = "gs",
    LOBBY_STATE = "ls", //all rooms
    ROOM_STATE = "rs", // all players.
    ERROR = "e",
}

export type Room = {
    id: string;
    players: LobbyPlayers[];
    game: Game;
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

export enum GRID_STATES {
    EMPTY = 0,
    RED = 1,
    BLUE = 2,
    GREEN = 3,
    ORANGE = 4,
    GHOST = 10,
    //Whatever colors we are using add them here.
}

export type GameState = {
    //Could be lots of thing in there, adding as I go.
    players: {
        name: string;
        score: string;
        board: number[][];
    }[];
};
