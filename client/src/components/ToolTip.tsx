import { BadgeInfo } from "lucide-react";

type InfoTooltipProps = {
    message: string;
};

export function InfoTooltip({ message }: InfoTooltipProps) {
    return (
        <span className="relative inline-flex group ml-1 align-middle z-51">
            <span className="flex items-center justify-center w-4 h-4 rounded-full bg-gray-500 text-white text-[10px] leading-none cursor-help select-none">
                <BadgeInfo />
            </span>
            <span
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1
                           hidden group-hover:block whitespace-normal
                           w-48 p-2 text-xs text-white bg-gray-800 rounded
                           shadow-lg z-10 pointer-events-none"
            >
                {message}
            </span>
        </span>
    );
}
