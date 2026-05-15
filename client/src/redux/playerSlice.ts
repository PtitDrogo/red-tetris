
import {createSlice, PayloadAction} from '@reduxjs/toolkit'

interface PlayerState {
    name: string
}

const initialState: PlayerState = {
    name: ''
}

const playerSlice = createSlice({
    name: 'player',
    initialState,
    reducers: {
        setPlayerName(state, action: PayloadAction<string>){
            state.name = action.payload
        }
    }
}
)

export const {setPlayerName} = playerSlice.actions
export default playerSlice.reducer