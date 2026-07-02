export function ControlsHelp() {
    return (
        <div className="bg-gray-800 rounded-xl p-4 flex flex-line gap-2.5 text-[13px] text-gray-400 font-sans mt-2 opacity-90">
            <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-200 font-medium">
                    ←
                </kbd>
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-200 font-medium">
                    →
                </kbd>
                <span>Move</span>
            </div>

            <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-200 font-medium">
                    ↑
                </kbd>
                <span>Rotate</span>
            </div>

            <div className="flex items-center gap-2">
                <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-gray-200 font-medium">
                    ↓
                </kbd>
                <span>Drop</span>
            </div>

            <div className="flex items-center gap-2">
                <kbd className="px-2 py-0.5 bg-gray-700 rounded text-gray-200 text-[10.5px] uppercase tracking-wide font-medium">
                    Space
                </kbd>
                <span>Hard Drop</span>
            </div>
        </div>
    );
}
