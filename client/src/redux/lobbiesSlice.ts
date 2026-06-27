import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { type LobbyState } from "../../../shared/types";

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
