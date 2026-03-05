import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    ChevronRight,
    Search,
    SlidersHorizontal,
    UserRoundPlus,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingSpinner } from "../general/LoadingSpinner";
import { BottomNavigation } from "../general/BottomNavigation";

export const RecipientSettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { state, refreshUser } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                if (state.isLoading) return;

                if (state.user) {
                    setIsLoading(false);
                } else if (state.isAuthenticated) {
                    await refreshUser();
                    setIsLoading(false);
                } else {
                    navigate("/login");
                }
            } catch {
                setIsLoading(false);
            }
        };

        loadUserData();
    }, [state.user, state.isAuthenticated, state.isLoading, refreshUser, navigate]);

    if (isLoading) {
        return <LoadingSpinner message="Loading recipients..." />;
    }

    return (
        <div className="h-screen bg-[#050505] text-white flex flex-col">
            <div className="flex items-center justify-between px-6 pt-8 pb-4">
                <button
                    onClick={() => navigate(-1)}
                    className="h-10 w-10 rounded-full bg-[#13170a] flex items-center justify-center"
                    aria-label="Back"
                >
                    <ArrowLeft className="text-white" size={22} />
                </button>

                <h1 className="text-lg font-medium text-white">Recipients</h1>

                <div className="w-8 h-8" />
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-24 scrollbar-hide">
                <div className="mt-3 flex items-center gap-3">
                    <div className="flex h-14 flex-1 items-center rounded-full border border-[#34413a] bg-transparent px-4">
                        <Search size={20} className="text-[#839089]" strokeWidth={1.8} />
                        <span className="ml-2 text-sm text-[#6f7d76]">Search</span>
                    </div>

                    <button className="flex h-14 w-14 items-center justify-center rounded-full bg-[#0e1715]">
                        <SlidersHorizontal size={20} className="text-[#8a9591]" strokeWidth={2.2} />
                    </button>
                </div>

                <button className="mt-4 flex w-full items-center rounded-full bg-[#13170a] px-4 py-4">
                    <UserRoundPlus size={20} className="text-[#ff4a3d]" strokeWidth={2.2} />
                    <span className="ml-3 text-base font-semibold">Add a recipient</span>
                    <ChevronRight size={22} className="ml-auto text-[#8b9792]" strokeWidth={2.2} />
                </button>

                <div className="mt-4 rounded-xl bg-[#13170a] px-6 pb-10 pt-8 text-center">
                    <div className="relative mx-auto h-[140px] w-[140px]">
                        <div className="absolute left-[20px] top-[40px] h-[95px] w-[95px] rounded-[60px_60px_10px_10px] border border-black bg-[#5e60df]" />
                        <div className="absolute left-[8px] top-[46px] h-[95px] w-[95px] rounded-[60px_60px_10px_10px] border border-black bg-[#9fa5ff]" />
                        <div className="absolute left-[34px] top-[6px] h-[34px] w-[34px] rounded-full border border-black bg-[#b1b3ff]" />

                        <div className="absolute left-[86px] top-[42px] h-[88px] w-[88px] rounded-[60px_60px_8px_8px] border border-black bg-[#032712]" />
                        <div className="absolute left-[112px] top-[14px] h-[30px] w-[30px] rounded-full bg-[#00230e]" />

                        <div className="absolute left-[78px] top-[60px] rotate-[10deg] text-[#f6c30e]">
                            <div className="h-16 w-6 rounded-[2px] bg-current" />
                            <div className="absolute left-[-10px] top-5 h-6 w-16 rounded-[2px] bg-current" />
                        </div>
                    </div>

                    <p className="mt-4 text-base font-semibold">No recipients added yet</p>
                    <p className="mt-2 text-base text-[#8f9b95]">
                        Add someone to start sending money
                    </p>
                </div>
            </div>

            <BottomNavigation currentPath="/wallet" />
        </div>
    );
};
