import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import playerReducer, { setPlayerName } from "../../redux/playerSlice";
import Home from "../../components/Home";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
    useNavigate: () => mockNavigate,
}));

vi.mock("../../redux/playerSlice", async (importOriginal) => {
    const actual = await importOriginal<any>();
    return {
        ...actual,
        setPlayerName: vi.fn((name) => ({
            type: "player/setPlayerName",
            payload: name,
        })),
    };
});

const renderHomeWithRedux = () => {
    const store = configureStore({
        middleware: (getDefaultMiddleware) =>
            getDefaultMiddleware({ serializableCheck: false }),
        reducer: {
            player: playerReducer,
        },
    });

    const dispatchSpy = vi.spyOn(store, "dispatch");

    return {
        store,
        dispatchSpy,
        ...render(
            <Provider store={store}>
                <Home />
            </Provider>,
        ),
    };
};

describe("Home Component", () => {
    test("Initial stable render and triggers init/cleanup actions in useEffect", () => {
        const { dispatchSpy, unmount } = renderHomeWithRedux();

        expect(
            screen.getByRole("heading", { name: /Enter your name/i }),
        ).toBeInTheDocument();

        expect(dispatchSpy).toHaveBeenCalledWith({ type: "socket/initHome" });

        unmount();
        expect(dispatchSpy).toHaveBeenCalledWith({
            type: "socket/cleanupHome",
        });
    });

    test("Error branch: Displays a message if the name is less than 3 characters long", () => {
        renderHomeWithRedux();
        const input = screen.getByRole("textbox");
        const button = screen.getByRole("button", { name: /PLAY NOW!/i });

        fireEvent.change(input, { target: { value: "Ab" } });
        fireEvent.click(button);

        expect(
            screen.getByText(/Your name must contain at least 3 characters/i),
        ).toBeInTheDocument();
        expect(setPlayerName).not.toHaveBeenCalled();
    });

    test("Error branch: Displays a message if the name exceeds the maximum length", () => {
        renderHomeWithRedux();
        const input = screen.getByRole("textbox");
        const button = screen.getByRole("button", { name: /PLAY NOW!/i });

        fireEvent.change(input, { target: { value: "A".repeat(13) } });
        fireEvent.click(button);

        expect(
            screen.getByText(
                /Your name must contain no more than 12 characters/i,
            ),
        ).toBeInTheDocument();
        expect(setPlayerName).not.toHaveBeenCalled();
    });

    test("Success branch (Button Click): Saves the name and calls the connection action", () => {
        const { dispatchSpy } = renderHomeWithRedux();
        const input = screen.getByRole("textbox");
        const button = screen.getByRole("button", { name: /PLAY NOW!/i });

        fireEvent.change(input, { target: { value: "Alex" } });
        fireEvent.click(button);

        expect(setPlayerName).toHaveBeenCalledWith("Alex");
        expect(dispatchSpy).toHaveBeenCalledWith({
            type: "socket/connectPlayer",
            payload: { navigate: expect.any(Function) },
        });
    });

    test("Success branch (Enter Key): Submits the form when pressing Enter", () => {
        const { dispatchSpy } = renderHomeWithRedux();
        const input = screen.getByRole("textbox");

        fireEvent.change(input, { target: { value: "Bob" } });

        fireEvent.keyDown(input, { key: "Enter", code: "Enter", charCode: 13 });

        expect(setPlayerName).toHaveBeenCalledWith("Bob");
        expect(dispatchSpy).toHaveBeenCalledWith({
            type: "socket/connectPlayer",
            payload: { navigate: expect.any(Function) },
        });
    });

    test("Does nothing when pressing a key other than Enter", () => {
        const { dispatchSpy } = renderHomeWithRedux();
        const input = screen.getByRole("textbox");

        fireEvent.change(input, { target: { value: "Bob" } });

        fireEvent.keyDown(input, { key: "ArrowUp" });

        expect(dispatchSpy).not.toHaveBeenCalledWith({
            type: "socket/connectPlayer",
            payload: expect.any(Object),
        });
    });
});