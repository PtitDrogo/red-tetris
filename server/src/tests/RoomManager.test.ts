import { describe, it, expect, beforeEach } from "vitest";
import { GameStatus } from "../../../shared/types.js";
import { RoomManager } from "../services/RoomManager.js";

describe("RoomManager", () => {
  let roomManager: RoomManager;

  beforeEach(() => {
    roomManager = new RoomManager();
  });

  describe("create", () => {
    it("should create a new room with a WAITING status and empty players", () => {
      const room = roomManager.create("room-1");

      expect(room).toEqual({
        id: "room-1",
        players: [],
        gameInfo: { status: GameStatus.WAITING },
      });
      expect(roomManager.get("room-1")).toBe(room);
    });

    it("should throw an error if a room with the same ID already exists", () => {
      roomManager.create("room-1");
      expect(() => roomManager.create("room-1")).toThrowError(
        'Room "room-1" already exists'
      );
    });
  });

  describe("deletePlayer", () => {
    it("should throw an error if the player socketId is not found in any room", () => {
      expect(() => roomManager.deletePlayer("non-existent-socket")).toThrowError(
        "Didn't find the user in any Room, so he cant leave"
      );
    });

    it("should remove a player from a room and return the updated room", () => {
      const room = roomManager.create("room-1");
      room.players.push(
        { name: "Alice", socketId: "socket-alice" },
        { name: "Bob", socketId: "socket-bob" }
      );

      const updatedRoom = roomManager.deletePlayer("socket-alice");

      expect(updatedRoom).toBeDefined();
      expect(updatedRoom?.players).toHaveLength(1);
      expect(updatedRoom?.players[0].name).toBe("Bob");
    });

    it("should completely delete the room and return null if the last player leaves", () => {
      const room = roomManager.create("room-1");
      room.players.push({ name: "Alice", socketId: "socket-alice" });

      const result = roomManager.deletePlayer("socket-alice");

      expect(result).toBeNull();
      expect(roomManager.get("room-1")).toBeUndefined();
    });
  });

  describe("getRoomBySocketId", () => {
    it("should find the correct room a player belongs to", () => {
      const room1 = roomManager.create("room-1");
      const room2 = roomManager.create("room-2");

      room1.players.push({ name: "Alice", socketId: "socket-alice" });
      room2.players.push({ name: "Bob", socketId: "socket-bob" });

      expect(roomManager.getRoomBySocketId("socket-bob")).toBe(room2);
      expect(roomManager.getRoomBySocketId("socket-missing")).toBeUndefined();
    });
  });

  describe("getAvailableRooms", () => {
    it("should only return custom lobby data for rooms with WAITING status", () => {
      const room1 = roomManager.create("room-1"); 
      const room2 = roomManager.create("room-2"); 
      room2.gameInfo.status = GameStatus.ONGOING;

      room1.players.push({ name: "Alice", socketId: "socket-alice" });

      const available = roomManager.getAvailableRooms();

      expect(available).toHaveLength(1);
      expect(available[0]).toEqual({
        id: "room-1",
        players: ["Alice"], 
      });
    });
  });
});