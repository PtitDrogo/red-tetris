import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../redux";

function MainGrid({ playerName }: { playerName: string }) {
    return (
        <>
            <div className="flex flex-col items-center">
                <div className="py-4">{playerName}</div>
                <div className="grid grid-cols-10 grid-rows-20 border-l border-t border-black">
                    {Array.from({ length: 200 }, (value, index) => (
                        <div
                            key={index}
                            className="border-r border-b border-black w-8 h-8"
                        />
                    ))}
                </div>
            </div>
        </>
    );
}

function OpponentGrid({ opponentName }: { opponentName: string }) {
    return (
        <>
            <div className="flex flex-col items-center">
                <div className="py-2 text-sm">{opponentName}</div>
                <div className="grid grid-cols-10 grid-rows-20 border-l border-t border-gray-700">
                    {Array.from({ length: 200 }, (value, index) => (
                        <div
                            key={index}
                            className="border-r border-b border-gray-700 w-4 h-4"
                        />
                    ))}
                </div>
            </div>
        </>
    );
}

function Game() {
    const navigate = useNavigate();
    const playerName = useSelector((state: RootState) => state.player.name);

    return (
        <>
            <div className="flex justify-center items-center pt-20 gap-40">
                <div className="flex flex-col gap-20">
                    <OpponentGrid opponentName="pablo"></OpponentGrid>
                    <OpponentGrid opponentName="pablo"></OpponentGrid>
                </div>
                <MainGrid playerName={playerName}></MainGrid>
                <div className="flex flex-col gap-20">
                    <OpponentGrid opponentName="pablo"></OpponentGrid>
                    <OpponentGrid opponentName="pablo"></OpponentGrid>
                </div>
            </div>
            <div className="fixed bottom-4 right-4">
                <input
                    type="button"
                    className="border border-black px-3"
                    value="Quit"
                    onClick={() => navigate("/lobbylist")}
                ></input>
            </div>
        </>
    );
}

export default Game;
