import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface LobbyState {
    name: string;
    players: string[];
}

interface LobbiesState {
    list: LobbyState[];
}

const initialState: LobbiesState = {
    list: [],
};

const lobbiesSlice = createSlice({
    name: "lobbies",
    initialState,
    reducers: {
        setLobbies(state, action: PayloadAction<LobbyState[]>) {
            state.list = action.payload;
        },
    },
});

export const { setLobbies } = lobbiesSlice.actions;
export default lobbiesSlice.reducer;
