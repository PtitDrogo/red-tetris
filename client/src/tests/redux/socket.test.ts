import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const ioMock = vi.fn();

vi.mock("socket.io-client", () => ({
    io: (...args: unknown[]) => ioMock(...args),
}));

describe("socket", () => {
    beforeEach(() => {
        vi.resetModules();
        ioMock.mockReset();
        ioMock.mockReturnValue({ connected: false });
    });

    afterEach(() => {
        vi.unstubAllEnvs();
    });

    it("falls back to http://localhost:3000 when VITE_BACKEND_URL is not set", async () => {
        vi.stubEnv("VITE_BACKEND_URL", undefined as unknown as string);
        await import("./../../socket");
        expect(ioMock).toHaveBeenCalledWith(
            "http://localhost:3000",
            expect.anything(),
        );
    });

    it("calls io with the backend URL from VITE_BACKEND_URL", async () => {
        vi.stubEnv("VITE_BACKEND_URL", "http://localhost:4000");
        await import("./../../socket");

        expect(ioMock).toHaveBeenCalledTimes(1);
        expect(ioMock).toHaveBeenCalledWith(
            "http://localhost:4000",
            expect.anything(),
        );
    });

    it("disables autoConnect so the socket does not connect immediately on load", async () => {
        vi.stubEnv("VITE_BACKEND_URL", "http://localhost:4000");
        await import("./../../socket");

        const [, options] = ioMock.mock.calls[0];
        expect(options).toMatchObject({ autoConnect: false });
    });

    it("disables built-in reconnection behavior", async () => {
        vi.stubEnv("VITE_BACKEND_URL", "http://localhost:4000");
        await import("./../../socket");

        const [, options] = ioMock.mock.calls[0];
        expect(options).toMatchObject({ reconnection: false });
    });

    it("exports the socket instance returned by io()", async () => {
        const fakeSocketInstance = { id: "abc123", connected: false };
        ioMock.mockReturnValue(fakeSocketInstance);
        vi.stubEnv("VITE_BACKEND_URL", "http://localhost:4000");

        const { socket } = await import("./../../socket");
        expect(socket).toBe(fakeSocketInstance);
    });

    it("passes whatever VITE_BACKEND_URL is configured, even if it changes", async () => {
        vi.stubEnv("VITE_BACKEND_URL", "https://example-backend.test");
        await import("./../../socket");

        expect(ioMock).toHaveBeenCalledWith(
            "https://example-backend.test",
            expect.anything(),
        );
    });
});
