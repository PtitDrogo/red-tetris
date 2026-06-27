import { describe, test, expect } from "vitest";
import lobbiesReducer, { setLobbies } from "../../redux/lobbiesSlice";
import { type LobbyState } from "../../../../shared/types";

describe("lobbiesSlice", () => {
    test("devrait retourner l'état initial par défaut", () => {
        const state = lobbiesReducer(undefined, { type: "@@INIT" });

        expect(state.list).toEqual([]);
    });

    test("devrait gérer setLobbies et mettre à jour la liste des salons", () => {
        const mockLobbies: LobbyState[] = [
            {
                id: "room-alpha",
                players: [
                    { name: "Alex", socketId: "sock-1" },
                    { name: "Bob", socketId: "sock-2" },
                ],
            },
            {
                id: "room-beta",
                players: [{ name: "Charlie", socketId: "sock-3" }],
            },
        ];

        const state = lobbiesReducer(undefined, setLobbies(mockLobbies));

        expect(state.list).toHaveLength(2);
        expect(state.list[0].id).toBe("room-alpha");
        expect(state.list[0].players[0].name).toBe("Alex");
        expect(state.list[1].id).toBe("room-beta");
    });
});
