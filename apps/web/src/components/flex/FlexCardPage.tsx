import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CircleQuestionMark,
    ChevronDown,
    Music,
    MonitorPlay,
    PenTool,
    Sparkles,
    Wallet,
    Headphones,
    TvMinimalPlay,
} from "lucide-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { FlexCardRequestDrawer } from "@/components/flex/FlexCardRequestDrawer";
import { useWalletCard } from "@/contexts/WalletCardContext";

export const FlexCardPage: React.FC = () => {
    const navigate = useNavigate();
    const [showHelpDrawer, setShowHelpDrawer] = useState(false);
    const [showFlexCardDrawer, setShowFlexCardDrawer] = useState(false);
    const [benefitsExpanded, setBenefitsExpanded] = useState(false);
    const { cardData, displayCurrency, displayFiatSymbol, showBalance } = useWalletCard();

    // Flex wallet card hidden — show savings figures on Flex Card promo page
    const savingsCard = cardData.find((c) => c.type === "savings");
    const flexBalance = savingsCard?.displayBalanceValue ?? 0;
    const flexYield = savingsCard?.projectedInterestUsd ?? 0;
    const flexApy = savingsCard?.apyPercent ?? "0";

    const displayBalance = displayCurrency === "NGN"
        ? `${displayFiatSymbol}${flexBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
        : `${displayFiatSymbol}${flexBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const displayYield = displayCurrency === "NGN"
        ? `${displayFiatSymbol}${(flexYield * 1500).toFixed(2)}/wk`
        : `${displayFiatSymbol}${flexYield.toFixed(2)}/wk`;

    const handleBackClick = () => {
        navigate("/earn");
    };

    const handleTopUp = () => {
        navigate("/wallet/savings");
    };

    const handleRequestCard = () => {
        setShowFlexCardDrawer(true);
    };

    return (
        <div className="min-h-full bg-[#050505] text-white flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-8">
                <button
                    onClick={handleBackClick}
                    className="h-10 w-10 rounded-full bg-[#151515] flex items-center justify-center"
                >
                    <ArrowLeft className="text-white" size={22} />
                </button>
                <h1 className="text-base font-medium text-white">Flex Card</h1>
                <button
                    onClick={() => setShowHelpDrawer(true)}
                    className="w-8 h-8 bg-[#505050] rounded-full flex items-center justify-center"
                >
                    <CircleQuestionMark color="#fff" size={16} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 pb-20 scrollbar-hide">
                {/* Designed Card */}
                <div className="w-full h-44 relative rounded-2xl overflow-hidden mb-6 bg-[linear-gradient(145deg,#1a1a1a_0%,#2d2d2d_40%,#1a1a1a_100%)] border border-[#333]">
                    {/* Subtle texture lines */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.5) 20px, rgba(255,255,255,0.5) 21px)" }} />

                    {/* Top-right highlight */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/[0.02] rounded-full blur-3xl" />

                    <div className="relative z-10 p-5 h-full flex flex-col justify-between">
                        {/* Top row: brand + contactless */}
                        <div className="flex items-start justify-between">
                            <div>
                            <p className="text-xs tracking-widest text-white/40 font-medium uppercase">Lisar Flex</p>
                            </div>
                            {/* Contactless icon */}
                            <svg className="text-white/30" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M8.5 16.5a5 5 0 0 1 0-9" />
                                <path d="M12 19a9 9 0 0 1 0-14" />
                                <path d="M15.5 21.5a13 13 0 0 1 0-19" />
                            </svg>
                        </div>

                        {/* Bottom row: name + yield + Mastercard */}
                        <div className="flex items-end justify-between">
                            <div>
                                <p className="text-[10px] uppercase mb-2 text-white/70">Supports</p>
                                <div className="flex gap-2 items-center">
                                    <img src="/claude.svg" alt="Lisar Logo" className="w-5 h-5" />
                                    <img src="/lovable.png" alt="Lisar Logo" className="w-5 h-5" />
                                    <img src="/spotify2.png" alt="Lisar Logo" className="w-5 h-5" />
                                    <img src="/capcut.jpg" alt="Lisar Logo" className="w-5 h-5 rounded-full" />
                                    <img src="/netflix.png" alt="Lisar Logo" className="w-5 h-5" />
                                </div>
                            </div>


                            {/* Mastercard logo */}
                            <div className="flex items-center">
                                <div className="w-7 h-7 rounded-full bg-[#EB001B]" />
                                <div className="w-7 h-7 rounded-full bg-[#F79E1B] -ml-3" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Balance Card */}
                <Card className="bg-[#1a1a1a] border-gray-800 py-0 mb-4">
                    <CardContent className="px-4 py-4">
                        <CardTitle className="text-white text-base mb-2">Flex card</CardTitle>
                        <p className="text-xs text-gray-400 mb-4">
                        Pay for services you enjoy with yield from your savings. Over 1700+ providers and services supported.
                        </p>
                        <div className="grid grid-cols-[2fr_1fr] gap-3">
                            <div className="p-2 bg-[#505050] rounded-md">
                                <p className="text-sm font-semibold text-white/90">Bal: {showBalance ? 0 : "••••"}</p>
                            </div>
                            <Button
                                onClick={handleTopUp}
                                disabled={true}
                                className="bg-[#C7EF6B] hover:bg-[#B8E55A] text-black font-medium text-xs px-2 py-1 rounded-full transition-colors"
                            >
                                Top up
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Benefits Card - Collapsible */}
                <Card className="bg-[#1a1a1a] border-gray-800 py-0 mb-4">
                    <CardContent className="px-4 py-3">
                        <button
                            onClick={() => setBenefitsExpanded(!benefitsExpanded)}
                            className="flex items-center justify-between w-full mb-0"
                        >
                            <CardTitle className="text-white text-sm">
                                Card Benefits
                            </CardTitle>
                            <ChevronDown
                                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${benefitsExpanded ? "rotate-180" : ""}`}
                            />
                        </button>

                        {benefitsExpanded && (
                            <div className="space-y-3 mt-3">
                                <div className="flex items-center gap-3 p-2 rounded-lg bg-[#505050]">
                                    <p className="text-xs text-white/90">1 month Spotify Premium — comes with every card</p>
                                </div>

                                <div className="flex items-center gap-3 p-2 rounded-lg bg-[#505050]">
                                    <p className="text-xs text-white/90">Pay for subscriptions on your fav ❤️ tools (Claude code, Adobe, and more) with your savings yield.</p>
                                </div>
                                <div className="flex items-center gap-3 p-2 rounded-lg bg-[#505050]">
                                    <p className="text-xs text-white/90">Accepted at over 1700+ stores and merchants worldwide, including Google Pay and Apple Pay.</p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* How It Works */}
                <Card className="bg-[#1a1a1a] border-gray-800 py-0 mb-4">
                    <CardContent className="px-4 py-4">
                        <CardTitle className="text-white text-sm mb-3">How It Works</CardTitle>
                        <div className="space-y-2">
                            <p className="text-xs text-gray-400">1. Fund your Flex wallet on Lisar</p>
                            <p className="text-xs text-gray-400">2. Request for your Flex Card (12-24hr processing)</p>
                            <p className="text-xs text-gray-400">3. Yield from your wallet covers subscription costs automatically</p>
                        </div>
                    </CardContent>
                </Card>

                {/* CTA */}
                <div className="p-4 bg-[#1a1a1a] border border-gray-800 rounded-lg mb-6">
                    <h3 className="text-white font-semibold mb-1 text-sm">
                        Ready to get your card?
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">
                        Request your Flex Card and start covering your favourite subscriptions with your savings yield.
                    </p>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleRequestCard();
                        }}
                        className="w-full py-2.5 bg-[#C7EF6B] hover:bg-[#B8E55A] text-black font-medium rounded-full transition-colors text-sm mb-3"
                    >
                        Get a Card
                    </button>
                </div>
            </div>

            {/* Flex Card Request Drawer */}
            <FlexCardRequestDrawer
                isOpen={showFlexCardDrawer}
                onClose={() => setShowFlexCardDrawer(false)}
            />

            {/* Help Drawer */}
            <HelpDrawer
                isOpen={showHelpDrawer}
                onClose={() => setShowHelpDrawer(false)}
                title="Flex Card Guide"
                content={[
                    "The Flex Card is linked to your Lisar Flex wallet and uses your earned yield to pay for subscriptions.",
                    "Request processing takes 12-24 hours for card delivery.",
                ]}
            />
        </div>
    );
};
