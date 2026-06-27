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
    test("Rendu initial stable et déclenchement des actions d'init/cleanup dans le useEffect", () => {
        const { dispatchSpy, unmount } = renderHomeWithRedux();

        expect(
            screen.getByRole("heading", { name: /Red\s?Tetris/i }),
        ).toBeInTheDocument();

        expect(
            screen.getByRole("heading", { name: /Enter your name/i }),
        ).toBeInTheDocument();

        expect(dispatchSpy).toHaveBeenCalledWith({ type: "socket/initHome" });

        unmount();
        expect(dispatchSpy).toHaveBeenCalledWith({
            type: "socket/cleanupHome",
        });
    });

    test("Branche d'erreur : Affiche un message si le nom fait moins de 3 caractères", () => {
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

    test("Branche d'erreur : Affiche un message si le nom dépasse la taille maximale", () => {
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

    test("Branche de succès (Clic Bouton) : Enregistre le nom et appelle l'action de connexion", () => {
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

    test("Branche de succès (Touche Enter) : Soumet le formulaire à l'appui sur Enter", () => {
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

    test("Ne fait rien à l'appui d'une autre touche que Enter", () => {
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
