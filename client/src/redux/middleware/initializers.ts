import {
    GameOverRanking,
    GameStatus,
    LobbyState,
    ServerMessage,
} from "../../../../shared/types";
import { socket } from "../../socket";
import {
    setGameOver,
    setGrids,
    setMyGrid,
    setOwner,
    setPlayWithBlessed,
    setStatus,
} from "../gameSlice";
import { setLobbies } from "../lobbiesSlice";

export function initGame(store: any) {
    socket.off(ServerMessage.ROOM_STATE);
    socket.off(ServerMessage.GAME_STATE);
    socket.off(ServerMessage.GAME_OVER);

    const grids: number[][][] = Array.from({ length: 5 }, () =>
        Array.from({ length: 20 }, (_, i) => Array(10).fill(0)),
    );

    socket.on(ServerMessage.ROOM_STATE, (payload) => {
        const playerName = store.getState().player.name; // Grab name from store

        if (payload.gameInfo.status === GameStatus.WAITING) {
            const opponents = payload.players.filter(
                (player: any) => player.name !== playerName,
            );

            const gridsState = Array.from({ length: 4 }, (_, index) => ({
                name: opponents[index]?.name || `Empty`,
                id: opponents[index]?.socketId || "Empty",
                score: 0,
                board: grids[index],
                oldBoard: [],
                isAlive: true,
                level: 0,
            }));

            const myGrid = {
                name: playerName,
                id: socket.id || "Empty",
                score: 0,
                board: grids[4],
                oldBoard: [],
                isAlive: true,
                level: 0,
            };

            store.dispatch(setMyGrid(myGrid));
            store.dispatch(setGrids(gridsState));
        }
        store.dispatch(setOwner(payload.players[0].socketId));
        store.dispatch(setStatus(payload.gameInfo.status));
    });

    // Inside initGame ...

    const MIN_OLD_BOARD_DISPLAY_MS = 100;
    const LAGGING_PACKET_LOCKOUT_MS = 50; // Ignore rapid consecutive flashes

    let oldBoardFirstShownAt: number | null = null;
    let lastOldBoardClearedAt: number = 0; // Tracks when the last animation ended
    let pendingTimeout: ReturnType<typeof setTimeout> | null = null;
    let pendingPayload: any = null;

    function applyGameState(payload: any) {
        const myGrid = payload.players.find(
            (grid: any) => grid.id === socket.id,
        );
        const playerGrids = payload.players.filter(
            (grid: any) => grid.id !== socket.id,
        );
        const hasOldBoard = myGrid.oldBoard && myGrid.oldBoard.length > 0;
        const boardToShow = hasOldBoard ? myGrid.oldBoard : myGrid.board;

        store.dispatch(setMyGrid({ ...myGrid, board: boardToShow }));
        store.dispatch(setGrids(playerGrids));
        store.dispatch(setPlayWithBlessed(payload.playWithBlessed));

        if (hasOldBoard) {
            if (oldBoardFirstShownAt === null) {
                oldBoardFirstShownAt = Date.now();
                console.log(
                    `%c[OldBoard] INITIAL PAINT`,
                    "color: #e67e22; font-weight: bold;",
                );
                scheduleApply(payload, MIN_OLD_BOARD_DISPLAY_MS);
            }
        } else {
            if (oldBoardFirstShownAt !== null) {
                console.log(
                    `%c[OldBoard] CLEAN SWAP back to fresh board!`,
                    "color: #2ecc71; font-weight: bold;",
                );
                lastOldBoardClearedAt = Date.now(); // Start the lockout clock right now
            }
            oldBoardFirstShownAt = null;
        }
    }

    function scheduleApply(payload: any, delay: number) {
        pendingPayload = payload;

        if (pendingTimeout) return;

        pendingTimeout = setTimeout(() => {
            pendingTimeout = null;
            const p = pendingPayload;
            pendingPayload = null;

            const myGrid = p.players.find((grid: any) => grid.id === socket.id);
            if (myGrid && myGrid.oldBoard && myGrid.oldBoard.length > 0) {
                console.log(
                    `[Scheduler] ⏰ Timeout hit! Force-clearing old board.`,
                );
                const updatedPlayers = p.players.map((grid: any) =>
                    grid.id === socket.id ? { ...grid, oldBoard: [] } : grid,
                );
                applyGameState({ ...p, players: updatedPlayers });
            } else {
                applyGameState(p);
            }
        }, delay);
    }

    socket.on(ServerMessage.GAME_STATE, (payload: any) => {
        const myGrid = payload.players.find(
            (grid: any) => grid.id === socket.id,
        );
        const incomingHasOldBoard =
            myGrid?.oldBoard && myGrid.oldBoard.length > 0;

        // 1. GUARD: Check if we are actively mid-animation
        if (oldBoardFirstShownAt !== null) {
            if (incomingHasOldBoard) {
                // Already tracking an old board, ignore extra server updates containing it
                return;
            }

            const elapsed = Date.now() - oldBoardFirstShownAt;
            const remaining = MIN_OLD_BOARD_DISPLAY_MS - elapsed;

            if (remaining > 0) {
                scheduleApply(payload, remaining);
                return;
            }
        }

        // 2. GUARD: Lockout lagging network updates that try to start a new flash too soon
        if (
            incomingHasOldBoard &&
            Date.now() - lastOldBoardClearedAt < LAGGING_PACKET_LOCKOUT_MS
        ) {
            console.log(
                `[Socket] 🛡️ Blocked a double-flash caused by a lagging server packet.`,
            );
            return;
        }

        // Past the window or normal state, execute cleanly
        if (pendingTimeout) {
            clearTimeout(pendingTimeout);
            pendingTimeout = null;
            pendingPayload = null;
        }
        applyGameState(payload);
    });

    socket.off(ServerMessage.GAME_OVER);
    socket.on(
        ServerMessage.GAME_OVER,
        (payload: { level: number; ranking: GameOverRanking[] }) => {
            store.dispatch(setGameOver(payload));
        },
    );
}

export function initLobbies(store: any, action: any) {
    const { navigate } = action.payload;
    socket.off(ServerMessage.ERROR);
    socket.off(ServerMessage.LOBBY_STATE);
    socket.off(ServerMessage.JOIN_ROOM);
    socket.off(ServerMessage.ROOM_STATE);

    const grids: number[][][] = Array.from({ length: 5 }, () =>
        Array.from({ length: 20 }, (_, i) => Array(10).fill(0)),
    );

    socket.on(ServerMessage.ROOM_STATE, (payload) => {
        const state = store.getState();
        const playerName = state.player.name;

        const opponents = payload.players.filter(
            (player: any) => player.socketId !== socket.id,
        );

        const gridsState = Array.from({ length: 4 }, (_, index) => ({
            name: opponents[index]?.name || `Empty`,
            id: opponents[index]?.socketId || `Empty`,
            score: 0,
            board: grids[index],
            oldBoard: [],
            isAlive: true,
            level: 0,
        }));

        const myGrid = {
            name: playerName,
            id: socket.id || "Empty",
            score: 0,
            board: grids[4],
            oldBoard: [],
            isAlive: true,
            level: 0,
        };

        store.dispatch(setMyGrid(myGrid));
        store.dispatch(setGrids(gridsState));
        store.dispatch(setOwner(payload.players[0].socketId));
    });
    socket.on(ServerMessage.JOIN_ROOM, (payload: string) => {
        const playerName = store.getState().player.name;
        navigate(`/${payload}/${playerName}`);
    });

    socket.on(ServerMessage.ERROR, (payload) => {
        console.log(payload);
    });

    socket.on(ServerMessage.LOBBY_STATE, (payload: LobbyState[]) => {
        store.dispatch(setLobbies(payload));
    });
}
