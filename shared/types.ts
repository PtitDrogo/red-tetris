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
    GAME_OVER = "go",
    LOBBY_STATE = "ls",
    ROOM_STATE = "rs",
    ERROR = "e",
    JOIN_ROOM = "jr",
    LEAVE_ROOM = "lr",
}

export type Room = {
    id: string;
    players: RoomPlayers[];
    gameInfo: RoomGameInfo;
};

export type LobbyState = Omit<Room, "gameInfo">;

export type RoomGameInfo = {
    status: GameStatus;
};

export enum GameStatus {
    WAITING = "Waiting",
    ONGOING = "Ongoing",
    OVER = "Over", //Lowkey were never using this
}

export type GameOverRanking = {
    name: string;
    points: number;
};

export type GameOverData = {
    ranking: GameOverRanking[];
};

export type RoomPlayers = {
    name: string;
    socketId: string; //We dont need socketId im pretty sure
    //We can add more info here later maybe :_
};

export enum GRID_STATES {
    EMPTY = 0,
    RED = 1,
    BLUE = 2,
    GREEN = 3,
    ORANGE = 4,
    GHOST = 10,
    BLOCKED = 9,
    //Whatever colors we are using add them here.
}

export type GameState = {
    //Could be lots of thing in there, adding as I go.
    players: {
        name: string;
        score: number;
        isAlive: boolean;
        board: number[][];
    }[];
};
