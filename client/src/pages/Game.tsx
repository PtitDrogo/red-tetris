
import { useNavigate } from "react-router-dom"

function Game() {
    const navigate = useNavigate()
    return(
        <>
            <div>Game</div>
            <input type="button" className="border-2 border-black" value="Quit" onClick={() => navigate('/lobbylist')}></input>
        </>
    )
}

export default Game