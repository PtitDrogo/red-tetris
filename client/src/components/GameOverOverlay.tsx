
import { Crown } from "lucide-react";
import { GameOverRanking } from "../../../shared/types";

export interface GameOverState {
    active: boolean;
    level: number;
    ranking: GameOverRanking[];
}

interface GameOverOverlayProps {
    gameOverOverlay: GameOverState;
    playerName: string;
    onClose: () => void;
}

function GameOverOverlay({gameOverOverlay, playerName, onClose} : GameOverOverlayProps) {
    if (!gameOverOverlay.active) return null;
    return (
        <div className="fixed inset-0 flex justify-center items-center z-51">
            <div className="bg-gray-800/70 border-t border-b border-electric-red/50 px-30 py-15 rounded-xl backdrop-blur-sm">
                {gameOverOverlay.ranking[0]?.name === playerName ? (
                    <div className="flex flex-col items-center">
                        <Crown
                            className="w-7 h-7 text-amber-400 fill-amber-400 animate-pulse"
                            strokeWidth={2}
                        />

                        <p className="text-xl font-medium text-amber-400 tracking-wide animate-pulse">
                            Congratulations !
                        </p>
                        <p className="text-xl font-medium text-slate-300 tracking-wide">
                            Score : {gameOverOverlay.ranking[0]?.points}
                        </p>
                        <p className="text-xl font-medium text-slate-300 tracking-wide">
                            Level : {gameOverOverlay.level}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center animate-pulse">
                        <p className="text-xl font-medium text-red-500 tracking-wide">
                            You lost...
                        </p>
                        <p className="text-xl font-medium text-slate-300 tracking-wide">
                            Score :{" "}
                            {
                                gameOverOverlay.ranking.find(
                                    (val) => val.name === playerName,
                                )?.points
                            }
                        </p>
                        <p className="text-xl font-medium text-slate-300 tracking-wide">
                            Level : {gameOverOverlay.level}
                        </p>
                    </div>
                )}
                <div className="flex flex-col justify-center">
                    <span className="mt-10 text-center text-xl">
                        Winner : {gameOverOverlay.ranking[0].name ?? "Empty"}
                    </span>
                    <span className="text-center text-xl">
                        Score : {gameOverOverlay.ranking[0].points ?? "0"}
                    </span>
                    <div className="mt-5 grid grid-cols-1 gap-2 w-full py-3">
                        {Array.from({ length: 4 }, (_, index) => (
                            <div
                                key={index}
                                className="border rounded-xs flex justify-between px-4"
                            >
                                <span>
                                    {index + 2 + " - "}
                                    {gameOverOverlay.ranking[index + 1]?.name ??
                                        "Empty"}
                                </span>
                                <span>
                                    {gameOverOverlay.ranking[index + 1]
                                        ?.points ?? "0"}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex justify-center items-center z-50">
                    <button
                        className="mt-10 pointer-events-auto bg-electric-red hover:bg-red-400 text-white font-bold text-xl px-8 py-4 rounded-xl shadow-2xl transform hover:scale-105 transition-all animate-shadow-pulse2"
                        onClick={onClose}
                    >
                        <span className="animate-slow-pulse">Continue</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default GameOverOverlay;
