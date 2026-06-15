import { useEffect, useRef, useState, useCallback } from "react";

// ─── Enums (mirrored from backend) ────────────────────────────────────────────

const ServerMessage = {
    GAME_STATE: "gs",
    LOBBY_STATE: "ls",
    ROOM_STATE: "rs",
    ERROR: "e",
};

const ClientMessage = {
    CREATE_ROOM: "c",
    JOIN_ROOM: "j",
    LEAVE_ROOM: "l",
    START_GAME: "s",
    PLAYER_INPUT: "i",
};

const GameInput = {
    LEFT: 0,
    RIGHT: 1,
    DOWN: 2,
    SPACE: 3,
    ROTATE: 4,
};

// Map grid state numbers to colors
const CELL_COLORS = {
    0: null, // EMPTY
    1: "#ef4444", // RED
    2: "#3b82f6", // BLUE
    3: "#22c55e", // GREEN
    4: "#f97316", // ORANGE
    10: "rgba(255,255,255,0.12)", // GHOST
};

const GHOST_BORDER = {
    10: "1px solid rgba(255,255,255,0.3)",
};

// ─── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
    const map = {
        idle: { label: "IDLE", color: "#6b7280" },
        creating: { label: "CREATING…", color: "#f59e0b" },
        waiting: { label: "WAITING", color: "#3b82f6" },
        starting: { label: "STARTING…", color: "#a855f7" },
        playing: { label: "IN GAME", color: "#22c55e" },
        error: { label: "ERROR", color: "#ef4444" },
    };
    const { label, color } = map[status] || map.idle;
    return (
        <span
            style={{
                display: "inline-block",
                padding: "2px 10px",
                borderRadius: 4,
                fontSize: 11,
                fontFamily: "'Share Tech Mono', monospace",
                letterSpacing: 2,
                fontWeight: 700,
                color: "#0a0a0a",
                background: color,
                boxShadow: `0 0 8px ${color}88`,
            }}
        >
            {label}
        </span>
    );
}

// ─── Tetris board ──────────────────────────────────────────────────────────────

function TetrisBoard({ board, playerName, isAlive }) {
    if (!board || board.length === 0) return null;

    const rows = board.length;
    const cols = board[0].length;
    const CELL = 28;
    const dead = isAlive === false;

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
            }}
        >
            <span
                style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: 13,
                    color: dead ? "#ef4444" : "#94a3b8",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                }}
            >
                {playerName}
            </span>
            <div style={{ position: "relative" }}>
                {dead && (
                    <div
                        style={{
                            position: "absolute",
                            inset: 0,
                            zIndex: 10,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(6, 11, 20, 0.82)",
                            borderRadius: 4,
                            backdropFilter: "blur(2px)",
                            gap: 6,
                        }}
                    >
                        <span
                            style={{
                                fontFamily: "'Share Tech Mono', monospace",
                                fontSize: 22,
                                fontWeight: 700,
                                color: "#ef4444",
                                letterSpacing: 6,
                                textShadow:
                                    "0 0 20px #ef4444, 0 0 40px #ef444488",
                                animation: "pulse 1.4s ease-in-out infinite",
                            }}
                        >
                            GAME OVER
                        </span>
                        <span
                            style={{
                                fontFamily: "'Share Tech Mono', monospace",
                                fontSize: 11,
                                color: "#64748b",
                                letterSpacing: 3,
                            }}
                        >
                            {playerName}
                        </span>
                    </div>
                )}
                <div
                    style={{
                        display: "grid",
                        gridTemplateRows: `repeat(${rows}, ${CELL}px)`,
                        gridTemplateColumns: `repeat(${cols}, ${CELL}px)`,
                        gap: 1,
                        background: "#0f172a",
                        border: `1px solid ${dead ? "#7f1d1d" : "#1e293b"}`,
                        borderRadius: 4,
                        padding: 4,
                        boxShadow: dead
                            ? "0 0 40px rgba(239,68,68,0.2), inset 0 0 20px rgba(0,0,0,0.5)"
                            : "0 0 40px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.5)",
                        opacity: dead ? 0.6 : 1,
                        transition: "opacity 0.3s, border-color 0.3s",
                    }}
                >
                    {board.map((row, r) =>
                        row.map((cell, c) => {
                            const color = CELL_COLORS[cell] ?? "#1e293b";
                            const isGhost = cell === 10;
                            const isEmpty = cell === 0;
                            return (
                                <div
                                    key={`${r}-${c}`}
                                    style={{
                                        width: CELL,
                                        height: CELL,
                                        background: isEmpty ? "#0f172a" : color,
                                        border: isGhost
                                            ? GHOST_BORDER[10]
                                            : isEmpty
                                              ? "1px solid #1e293b"
                                              : `1px solid ${color}cc`,
                                        borderRadius: 2,
                                        boxShadow:
                                            !isEmpty && !isGhost
                                                ? `inset 2px 2px 4px rgba(255,255,255,0.15), inset -1px -1px 3px rgba(0,0,0,0.4), 0 0 6px ${color}55`
                                                : "none",
                                        transition: "background 0.05s",
                                    }}
                                />
                            );
                        }),
                    )}
                </div>
            </div>
            {/* end position:relative wrapper */}
        </div>
    );
}

// ─── Key hint row ──────────────────────────────────────────────────────────────

function KeyHint({ keys, label }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ display: "flex", gap: 4 }}>
                {keys.map((k) => (
                    <kbd
                        key={k}
                        style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            background: "#1e293b",
                            border: "1px solid #334155",
                            borderBottom: "3px solid #475569",
                            borderRadius: 4,
                            fontFamily: "'Share Tech Mono', monospace",
                            fontSize: 11,
                            color: "#cbd5e1",
                            minWidth: 26,
                            textAlign: "center",
                        }}
                    >
                        {k}
                    </kbd>
                ))}
            </div>
            <span
                style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: 11,
                    color: "#64748b",
                }}
            >
                {label}
            </span>
        </div>
    );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function TestGame({ socket }) {
    const [status, setStatus] = useState("idle");
    const [roomId, setRoomId] = useState(null);
    const [players, setPlayers] = useState([]); // [{ name, board, score, level }]
    const [error, setError] = useState(null);
    const [log, setLog] = useState([]);
    const hasInit = useRef(false);

    const addLog = useCallback((msg) => {
        setLog((prev) => [
            ...prev.slice(-19),
            `${new Date().toLocaleTimeString()} › ${msg}`,
        ]);
    }, []);

    const sendInput = useCallback(
        (input) => {
            if (socket.connected) {
                socket.emit(ClientMessage.PLAYER_INPUT, input);
            }
        },
        [socket],
    );

    // ── Keyboard controls ──────────────────────────────────────────────────────
    useEffect(() => {
        const onKey = (e) => {
            // Prevent page scroll on arrow/space keys
            if (
                [
                    "ArrowLeft",
                    "ArrowRight",
                    "ArrowDown",
                    "ArrowUp",
                    " ",
                ].includes(e.key)
            ) {
                e.preventDefault();
            }
            if (e.key === "ArrowUp" && e.repeat) return;
            switch (e.key) {
                case "ArrowLeft":
                    sendInput(GameInput.LEFT);
                    break;
                case "ArrowRight":
                    sendInput(GameInput.RIGHT);
                    break;
                case "ArrowDown":
                    sendInput(GameInput.DOWN);
                    break;
                case "ArrowUp":
                    sendInput(GameInput.ROTATE);
                    break;
                case " ":
                    sendInput(GameInput.SPACE);
                    break;
                default:
                    break;
            }
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [sendInput]);

    // ── Socket setup & auto create+start ──────────────────────────────────────
    useEffect(() => {
        if (hasInit.current) return;
        hasInit.current = true;

        // ── Listeners ─────────────────────────────────────────────────────────
        socket.on(ServerMessage.ROOM_STATE, (data) => {
            addLog(`ROOM_STATE: ${JSON.stringify(data)}`);
            setRoomId(data.id);

            if (data.game?.status === "Waiting") {
                setStatus("waiting");
                // Auto-start the game once room is confirmed
                addLog("Auto-starting game…");
                setStatus("starting");
                socket.emit(ClientMessage.START_GAME);
            }
        });

        socket.on(ServerMessage.GAME_STATE, (data) => {
            // data expected: { players: [{ name, score, board, level }] }
            if (data?.players) {
                setPlayers(data.players);
                setStatus("playing");
            }
        });

        socket.on(ServerMessage.LOBBY_STATE, (data) => {
            addLog(`LOBBY_STATE received`);
        });

        socket.on(ServerMessage.ERROR, (data) => {
            const msg = typeof data === "string" ? data : JSON.stringify(data);
            addLog(`ERROR: ${msg}`);
            setError(msg);
            setStatus("error");
        });

        socket.on("connect", () => {
            addLog(`Connected: ${socket.id}`);
        });

        socket.on("disconnect", () => {
            addLog("Disconnected");
            setStatus("idle");
        });

        // ── Auto-create room on mount ──────────────────────────────────────────
        const doCreate = () => {
            addLog("Creating room…");
            setStatus("creating");
            socket.emit(ClientMessage.CREATE_ROOM);
        };

        if (socket.connected) {
            doCreate();
        } else {
            socket.once("connect", doCreate);
        }

        return () => {
            socket.off(ServerMessage.ROOM_STATE);
            socket.off(ServerMessage.GAME_STATE);
            socket.off(ServerMessage.LOBBY_STATE);
            socket.off(ServerMessage.ERROR);
            socket.off("connect");
            socket.off("disconnect");
            // Leave room on unmount
            if (roomId) socket.emit(ClientMessage.LEAVE_ROOM);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
        <div
            style={{
                minHeight: "100vh",
                background: "#060b14",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: "24px 16px 40px",
                fontFamily: "'Share Tech Mono', monospace",
            }}
        >
            {/* Google font import + keyframes */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.4; }
                }
            `}</style>

            {/* Header */}
            <div
                style={{
                    width: "100%",
                    maxWidth: 900,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 24,
                    borderBottom: "1px solid #1e293b",
                    paddingBottom: 16,
                }}
            >
                <div>
                    <div
                        style={{
                            fontSize: 22,
                            color: "#f1f5f9",
                            letterSpacing: 4,
                            fontWeight: 700,
                        }}
                    >
                        TETRIS <span style={{ color: "#3b82f6" }}>TEST</span>
                    </div>
                    {roomId && (
                        <div
                            style={{
                                fontSize: 10,
                                color: "#475569",
                                marginTop: 2,
                                letterSpacing: 1,
                            }}
                        >
                            ROOM: {roomId}
                        </div>
                    )}
                </div>
                <StatusBadge status={status} />
            </div>

            {/* Boards area */}
            <div
                style={{
                    display: "flex",
                    gap: 32,
                    flexWrap: "wrap",
                    justifyContent: "center",
                    marginBottom: 24,
                }}
            >
                {players.length === 0 ? (
                    <div
                        style={{
                            color: "#334155",
                            fontSize: 13,
                            letterSpacing: 2,
                            padding: "60px 40px",
                            border: "1px dashed #1e293b",
                            borderRadius: 8,
                        }}
                    >
                        {status === "playing"
                            ? "NO BOARD DATA"
                            : "WAITING FOR GAME…"}
                    </div>
                ) : (
                    players.map((p, i) => (
                        <div
                            key={i}
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: 10,
                            }}
                        >
                            <TetrisBoard
                                board={p.board}
                                playerName={String(p.name)}
                                isAlive={p.isAlive}
                            />

                            {/* Score & Level Dashboard Panel */}
                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    width: "100%",
                                    maxWidth: 280,
                                    padding: "0 4px",
                                    fontSize: 12,
                                    color: "#64748b",
                                    letterSpacing: 2,
                                }}
                            >
                                <div>
                                    SCORE:{" "}
                                    <span
                                        style={{
                                            color: "#f1f5f9",
                                            fontWeight: "700",
                                        }}
                                    >
                                        {p.score ?? "—"}
                                    </span>
                                </div>
                                <div>
                                    LEVEL:{" "}
                                    <span
                                        style={{
                                            color: "#a855f7",
                                            fontWeight: "700",
                                            textShadow:
                                                "0 0 8px rgba(168,85,247,0.4)",
                                        }}
                                    >
                                        {p.level ?? 0}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Controls legend */}
            <div
                style={{
                    display: "flex",
                    gap: 20,
                    flexWrap: "wrap",
                    justifyContent: "center",
                    marginBottom: 24,
                    padding: "12px 20px",
                    background: "#0d1829",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                }}
            >
                <KeyHint keys={["←"]} label="Left" />
                <KeyHint keys={["→"]} label="Right" />
                <KeyHint keys={["↓"]} label="Down" />
                <KeyHint keys={["↑"]} label="Rotate" />
                <KeyHint keys={["SPC"]} label="Drop" />
            </div>

            {/* Error banner */}
            {error && (
                <div
                    style={{
                        width: "100%",
                        maxWidth: 700,
                        background: "#450a0a",
                        border: "1px solid #7f1d1d",
                        borderRadius: 6,
                        padding: "10px 16px",
                        color: "#fca5a5",
                        fontSize: 12,
                        letterSpacing: 1,
                        marginBottom: 16,
                    }}
                >
                    ⚠ {error}
                </div>
            )}

            {/* Event log */}
            <div
                style={{
                    width: "100%",
                    maxWidth: 700,
                    background: "#0a0f1a",
                    border: "1px solid #1e293b",
                    borderRadius: 8,
                    padding: 12,
                    maxHeight: 180,
                    overflowY: "auto",
                }}
            >
                <div
                    style={{
                        fontSize: 10,
                        color: "#334155",
                        letterSpacing: 2,
                        marginBottom: 8,
                    }}
                >
                    EVENT LOG
                </div>
                {log.length === 0 ? (
                    <div style={{ color: "#1e293b", fontSize: 11 }}>
                        no events yet…
                    </div>
                ) : (
                    [...log].reverse().map((line, i) => (
                        <div
                            key={i}
                            style={{
                                fontSize: 11,
                                color: i === 0 ? "#94a3b8" : "#334155",
                                padding: "1px 0",
                                fontFamily: "'Share Tech Mono', monospace",
                            }}
                        >
                            {line}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
