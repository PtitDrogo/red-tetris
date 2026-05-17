import { beforeEach, describe, expect, it } from "vitest";
import { GameStatus } from "../../../shared/types";
import { RoomManager } from "./RoomManager";

describe("RoomManager", () => {
    let manager: RoomManager;

    beforeEach(() => {
        manager = new RoomManager();
    });

    // -------------------------------------------------------------------------
    // create
    // -------------------------------------------------------------------------
    describe("create", () => {
        it("returns a room with the given id", () => {
            const room = manager.create("room-1");
            expect(room.id).toBe("room-1");
        });

        it("Creating a room with an already existing id throws", () => {
            const room = manager.create("room-1");
            expect(() => manager.create("room-1")).toThrow();
        });

        it("initialises the room with an empty players list", () => {
            const room = manager.create("room-1");
            expect(room.players).toEqual([]);
        });

        it("initialises the room with WAITING status", () => {
            const room = manager.create("room-1");
            expect(room.game.status).toBe(GameStatus.WAITING);
        });

        it("persists the room so it can be retrieved afterwards", () => {
            manager.create("room-1");
            expect(manager.get("room-1")).toBeDefined();
        });

        it("creates independent rooms for different ids", () => {
            manager.create("room-1");
            manager.create("room-2");
            expect(manager.list()).toHaveLength(2);
        });
    });

    // -------------------------------------------------------------------------
    // get
    // -------------------------------------------------------------------------
    describe("get", () => {
        it("returns the room for a known id", () => {
            const created = manager.create("room-1");
            expect(manager.get("room-1")).toEqual(created);
        });

        it("returns undefined for an unknown id", () => {
            expect(manager.get("does-not-exist")).toBeUndefined();
        });
    });

    // -------------------------------------------------------------------------
    // delete
    // -------------------------------------------------------------------------
    describe("delete", () => {
        it("removes the room from the manager", () => {
            manager.create("room-1");
            manager.delete("room-1");
            expect(manager.get("room-1")).toBeUndefined();
        });

        it("does not affect other rooms", () => {
            manager.create("room-1");
            manager.create("room-2");
            manager.delete("room-1");
            expect(manager.get("room-2")).toBeDefined();
        });

        it("is a no-op for an id that does not exist", () => {
            expect(() => manager.delete("ghost")).not.toThrow();
        });
    });

    // -------------------------------------------------------------------------
    // list
    // -------------------------------------------------------------------------
    describe("list", () => {
        it("returns an empty array when there are no rooms", () => {
            expect(manager.list()).toEqual([]);
        });

        it("returns all created rooms", () => {
            manager.create("room-1");
            manager.create("room-2");
            expect(manager.list()).toHaveLength(2);
        });

        it("does not include deleted rooms", () => {
            manager.create("room-1");
            manager.create("room-2");
            manager.delete("room-1");
            expect(manager.list()).toHaveLength(1);
        });
    });

    // -------------------------------------------------------------------------
    // getRoomBySocketId
    // -------------------------------------------------------------------------
    describe("getRoomBySocketId", () => {
        it("returns the room that contains the player", () => {
            const room = manager.create("room-1");
            room.players.push({ socketId: "socket-abc", name: "testAndy" });
            expect(manager.getRoomBySocketId("socket-abc")).toEqual(room);
        });

        it("returns undefined when no room contains the player", () => {
            manager.create("room-1");
            expect(manager.getRoomBySocketId("ghost-socket")).toBeUndefined();
        });

        it("finds the correct room when multiple rooms exist", () => {
            manager.create("room-1");
            const room2 = manager.create("room-2");
            room2.players.push({ socketId: "socket-xyz", name: "testAndy" });
            expect(manager.getRoomBySocketId("socket-xyz")?.id).toBe("room-2");
        });
    });

    // -------------------------------------------------------------------------
    // deletePlayer
    // -------------------------------------------------------------------------
    describe("deletePlayer", () => {
        it("throws when the socket id belongs to no room", () => {
            expect(() => manager.deletePlayer("ghost-socket")).toThrow();
        });

        it("removes the player from the room and returns the updated room", () => {
            const room = manager.create("room-1");
            room.players.push({ socketId: "socket-1", name: "testAndy1" });
            room.players.push({ socketId: "socket-2", name: "testAndy2" });

            const result = manager.deletePlayer("socket-1");

            expect(result).not.toBeNull();
            expect(result!.players.some((p) => p.socketId === "socket-1")).toBe(
                false,
            );
            expect(result!.players.some((p) => p.socketId === "socket-2")).toBe(
                true,
            );
        });

        it("deletes the room and returns null when the last player leaves", () => {
            const room = manager.create("room-1");
            room.players.push({ socketId: "solo-socket" } as any);

            const result = manager.deletePlayer("solo-socket");

            expect(result).toBeNull();
            expect(manager.get("room-1")).toBeUndefined();
        });

        it("does not affect other rooms when a room is deleted", () => {
            const room1 = manager.create("room-1");
            room1.players.push({ socketId: "socket-alone" } as any);
            manager.create("room-2");

            manager.deletePlayer("socket-alone");

            expect(manager.get("room-2")).toBeDefined();
        });
    });

    // -------------------------------------------------------------------------
    // getAvailableRooms
    // -------------------------------------------------------------------------
    describe("getAvailableRooms", () => {
        it("returns all rooms when all have WAITING status", () => {
            manager.create("room-1");
            manager.create("room-2");
            expect(manager.getAvailableRooms()).toHaveLength(2);
        });

        it("excludes rooms that are not in WAITING status", () => {
            manager.create("room-1");
            const room2 = manager.create("room-2");
            room2.game.status = GameStatus.ONGOING; // or any non-WAITING status

            expect(manager.getAvailableRooms()).toHaveLength(1);
            expect(manager.getAvailableRooms()[0].id).toBe("room-1");
        });

        it("returns an empty array when no rooms are available", () => {
            const room = manager.create("room-1");
            room.game.status = GameStatus.ONGOING;
            expect(manager.getAvailableRooms()).toEqual([]);
        });

        it("returns an empty array when there are no rooms at all", () => {
            expect(manager.getAvailableRooms()).toEqual([]);
        });
    });
});
