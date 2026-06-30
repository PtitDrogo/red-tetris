export enum PieceType {
    I = "I",
    J = "J",
    L = "L",
    O = "O",
    S = "S",
    T = "T",
    Z = "Z",
    B = "B",
}

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
    level: number;
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
    CYAN = 5,
    PURPLE = 6,
    YELLOW = 7,
    GHOST = 10,
    BLOCKED = 9,
    BLESSED = 11,
    FULL = 12,
    //Whatever colors we are using add them here.
}

export type GameState = {
    //Could be lots of thing in there, adding as I go.
    players: {
        name: string;
        score: number;
        isAlive: boolean;
        board: number[][];
        clearedLinesIndexes: number[];
    }[];
    playWithBlessed: boolean;
};

export const Shapes: Record<
    PieceType,
    { cells: Coordinate[]; color: GRID_STATES }
> = {
    //□□□□
    [PieceType.I]: {
        cells: [
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: 1, y: 0 },
            { x: 2, y: 0 },
        ],
        color: GRID_STATES.CYAN,
    },

    // □□
    // □□
    [PieceType.O]: {
        cells: [
            { x: 0, y: 0 },
            { x: -1, y: 0 },
            { x: 0, y: -1 },
            { x: -1, y: -1 },
        ],
        color: GRID_STATES.YELLOW,
    },

    // □
    // □□□

    [PieceType.J]: {
        cells: [
            { x: -1, y: -1 },
            { x: -1, y: 0 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
        ],
        color: GRID_STATES.BLUE,
    },

    //   □
    // □□□

    [PieceType.L]: {
        cells: [
            { x: -1, y: 0 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: +1, y: -1 },
        ],
        color: GRID_STATES.ORANGE,
    },

    //  □□
    // □□
    [PieceType.S]: {
        cells: [
            { x: -1, y: 0 },
            { x: 0, y: 0 },
            { x: 0, y: -1 },
            { x: 1, y: -1 },
        ],
        color: GRID_STATES.GREEN,
    },

    // □□
    //  □□
    [PieceType.Z]: {
        cells: [
            { x: -1, y: -1 },
            { x: 0, y: -1 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
        ],
        color: GRID_STATES.RED,
    },

    //  □
    // □□□

    [PieceType.T]: {
        cells: [
            { x: -1, y: 0 },
            { x: 0, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: -1 },
        ],
        color: GRID_STATES.PURPLE,
    },

    [PieceType.B]: {
        cells: [
            { x: 0, y: 0 },
        ],
        color: GRID_STATES.BLESSED,
    },
};

export type Coordinate = {
    x: number;
    y: number;
};
