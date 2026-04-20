import React from "react";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";

interface EarningsBreakdownDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    balance: number;
    apyPercent: string | number;
    displayCurrency: "USD" | "NGN";
    displayFiatSymbol: string;
    isEarningsProvided?: boolean;
    actualEarnings?: number;
    cardType?: "savings" | "staking";
}

export const EarningsBreakdownDrawer: React.FC<EarningsBreakdownDrawerProps> = ({
    isOpen,
    onClose,
    balance,
    apyPercent,
    displayCurrency,
    displayFiatSymbol,
    isEarningsProvided,
    actualEarnings,
    cardType,
}) => {
    const apy = typeof apyPercent === "string" ? parseFloat(apyPercent) : apyPercent;
    const yearly = !isNaN(apy) && apy > 0 ? balance * (apy / 100) : 0;
    const monthly = yearly / 12;
    const weekly = yearly / 52;
    const daily = yearly / 365;

    const totalAmount = isEarningsProvided && actualEarnings !== undefined ? actualEarnings : yearly;

    const formatValue = (val: number) => {
        return val.toLocaleString(undefined, {
            minimumFractionDigits: displayCurrency === "NGN" ? 2 : 3,
            maximumFractionDigits: displayCurrency === "NGN" ? 2 : 3,
        });
    };

    // Unified wallet breakdown theme
    const theme = { main: "#C7EF6B" };

    // SVG parameters
    const r = 36;
    const c = 2 * Math.PI * r;

    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="bg-[#050505] border-t border-white/5">
                <DrawerHeader className="pb-0">
                    <DrawerTitle className="text-center text-lg font-medium text-white/90">
                        Earnings
                    </DrawerTitle>
                </DrawerHeader>

                <div className="flex flex-col items-center pt-4">
                    {/* Donut Chart Section */}
                    <div className="relative w-[200px] h-[200px]">
                        <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90 origin-center overflow-visible">
                            {/* Background track */}
                            <circle cx="50" cy="50" r={r} fill="none" stroke="#1b221f" strokeWidth="14" />

                            {/* Monthly segment (100% opacity) */}
                            <circle cx="50" cy="50" r={r} fill="none" stroke={theme.main} strokeWidth="14" strokeDasharray={`${c * 0.45} ${c}`} strokeLinecap="round" className="opacity-100" />

                            {/* Weekly segment (60% opacity) */}
                            <circle cx="50" cy="50" r={r} fill="none" stroke={theme.main} strokeWidth="14" strokeDasharray={`${c * 0.25} ${c}`} strokeLinecap="round" className="opacity-60" transform="rotate(170 50 50)" />

                            {/* Daily segment (30% opacity) */}
                            <circle cx="50" cy="50" r={r} fill="none" stroke={theme.main} strokeWidth="14" strokeDasharray={`${c * 0.10} ${c}`} strokeLinecap="round" className="opacity-30" transform="rotate(270 50 50)" />
                        </svg>

                        {/* Center Total Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
                            <span className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">
                                Total
                            </span>
                            <span className="text-white text-lgxl font-semibold tracking-tight">
                                {displayFiatSymbol}{formatValue(totalAmount)}
                            </span>
                        </div>

                        {/* Tooltips */}
                        {/* Monthly Tooltip */}
                        <div className="absolute top-[8%] right-[-15%] bg-white text-[#121212] px-2.5 py-1 rounded shadow-lg text-[13px] font-bold z-10 transition-transform hover:scale-105">
                            <div className="absolute bottom-[-4px] left-4 w-2 h-2 bg-white rotate-45" />
                            {displayFiatSymbol}{formatValue(monthly)}
                        </div>

                        {/* Weekly Tooltip */}
                        <div className="absolute bottom-[20%] right-[-12%] bg-white text-[#121212] px-2.5 py-1 rounded shadow-lg text-[13px] font-bold z-10 transition-transform hover:scale-105">
                            <div className="absolute top-[-4px] left-4 w-2 h-2 bg-white rotate-45" />
                            {displayFiatSymbol}{formatValue(weekly)}
                        </div>

                        {/* Daily Tooltip */}
                        <div className="absolute bottom-[10%] left-[-15%] bg-white text-[#121212] px-2.5 py-1 rounded shadow-lg text-[13px] font-bold z-10 transition-transform hover:scale-105">
                            <div className="absolute top-[-4px] right-4 w-2 h-2 bg-white rotate-45" />
                            {displayFiatSymbol}{formatValue(daily)}
                        </div>
                    </div>

                    {/* Bottom Breakdown Ranges */}
                    <div className="grid grid-cols-3 gap-6 mt-4 w-full px-8 max-w-[400px] rounded-lg bg-[#2a2a2a] py-4">
                        <div className="flex flex-col">
                            <span className="text-gray-400 text-xs font-medium mb-1">Daily</span>
                            <span className="text-white text-[15px] font-semibold mb-2 truncate">
                                {displayFiatSymbol}{formatValue(daily)}
                            </span>
                            <div className="h-1.5 w-full bg-[#1b221f] rounded-full overflow-hidden">
                                <div className="h-full opacity-30 rounded-full" style={{ backgroundColor: theme.main, width: '15%' }} />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-gray-400 text-xs font-medium mb-1">Weekly</span>
                            <span className="text-white text-[15px] font-semibold mb-2 truncate">
                                {displayFiatSymbol}{formatValue(weekly)}
                            </span>
                            <div className="h-1.5 w-full bg-[#1b221f] rounded-full overflow-hidden">
                                <div className="h-full opacity-60 rounded-full" style={{ backgroundColor: theme.main, width: '45%' }} />
                            </div>
                        </div>

                        <div className="flex flex-col">
                            <span className="text-gray-400 text-xs font-medium mb-1">Monthly</span>
                            <span className="text-white text-[15px] font-semibold mb-2 truncate">
                                {displayFiatSymbol}{formatValue(monthly)}
                            </span>
                            <div className="h-1.5 w-full bg-[#1b221f] rounded-full overflow-hidden">
                                <div className="h-full opacity-100 rounded-full" style={{ backgroundColor: theme.main, width: '100%' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
