import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import LobbyList from "../../components/LobbyList";
import { ClientMessage } from "../../../../shared/types";

import lobbiesReducer from "../../redux/lobbiesSlice";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}));

vi.mock("../../hooks/useAuthGuard", () => ({
    useAuthGuard: vi.fn(),
}));

const renderLobbyListWithRedux = (lobbiesList: any[] = []) => {
    const store = configureStore({
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({ serializableCheck: false }),
        reducer: {
            player: (state = { name: "Alex" }, _action) => state,
            lobbies: lobbiesReducer,
        },
        preloadedState: {
            lobbies: { list: lobbiesList },
        },
    });

    const dispatchSpy = vi.spyOn(store, "dispatch");

    return {
        store,
        dispatchSpy,
        ...render(
            <Provider store={store}>
                <LobbyList />
            </Provider>,
        ),
    };
};

describe("LobbyList Component (100% Coverage)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    test("Initial render without room and complete useEffect lifecycle", () => {
        const { dispatchSpy, unmount } = renderLobbyListWithRedux([]);

        expect(screen.getByText(/Welcome Alex/i)).toBeInTheDocument();

        expect(
            screen.getByRole("button", { name: /Create a lobby/i }),
        ).toBeInTheDocument();

        expect(dispatchSpy).toHaveBeenCalledWith({
            type: "socket/initLobby",
            payload: { navigate: mockNavigate },
        });

        unmount();
        expect(dispatchSpy).toHaveBeenCalledWith({
            type: "socket/cleanupLobby",
        });
    });

    test("Clicking 'Create Room' dispatches the correct Redux/Socket action", () => {
        const { dispatchSpy } = renderLobbyListWithRedux([]);

        const createButton = screen.getByRole("button", {
            name: /Create a lobby/i,
        });
        fireEvent.click(createButton);

        expect(dispatchSpy).toHaveBeenCalledWith({
            type: "socket/emit",
            payload: {
                event: ClientMessage.CREATE_ROOM,
                data: "Alex",
            },
        });
    });

    test("Full render of active rooms and filling missing player slots", () => {
        const mockLobbies = [
            {
                id: "room-101",
                players: ["ChefAlex", "Bob", "Charlie"],
            },
        ];

        renderLobbyListWithRedux(mockLobbies);

        expect(screen.getByText("ChefAlex")).toBeInTheDocument();
        expect(screen.getByText("Bob")).toBeInTheDocument();
        expect(screen.getByText("Charlie")).toBeInTheDocument();

        const emptyLabels = screen.getAllByText("Empty");
        expect(emptyLabels.length).toBe(2);
    });

    test("Render of a room with no primary player (Empty edge case)", () => {
        const mockLobbies = [
            {
                id: "room-empty",
                players: [],
            },
        ];

        renderLobbyListWithRedux(mockLobbies);

        const emptyLabels = screen.getAllByText("Empty");
        expect(emptyLabels.length).toBe(5);
    });

    test("Clicking on a room calls joinLobby with the correct payload", () => {
        const mockLobbies = [
            {
                id: "room-abc",
                players: ["ChefAlex"],
            },
        ];

        const { dispatchSpy } = renderLobbyListWithRedux(mockLobbies);

        const lobbyButton = screen.getByRole("button", { name: /ChefAlex/i });
        fireEvent.click(lobbyButton);

        expect(dispatchSpy).toHaveBeenCalledWith({
            type: "socket/emit",
            payload: {
                event: ClientMessage.JOIN_ROOM,
                data: {
                    roomID: "room-abc",
                    playerName: "Alex",
                },
            },
        });
    });
});