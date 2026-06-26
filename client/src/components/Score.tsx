type ScoreProps = {
    score: number;
    level?: number;
};

export function Score({ score, level }: ScoreProps) {
    return (
        <div className="flex flex-col border border-white w-full bg-gray-700 text-center">
            <span>Score: {score}</span>
            {level !== undefined && <span>Level: {level}</span>}
        </div>
    );
}
