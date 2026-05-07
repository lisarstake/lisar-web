import React, { useState } from "react";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerFooter,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { InfoIcon } from "lucide-react";

interface FlexCardRequestDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export const FlexCardRequestDrawer: React.FC<FlexCardRequestDrawerProps> = ({ isOpen, onClose }) => {
    const { state } = useAuth();
    const { user, isAuthenticated } = state;
    const [nameOnCard, setNameOnCard] = useState("");
    const [understood, setUnderstood] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRequest = async () => {
        if (!isAuthenticated || !user) {
            toast.error("Please log in to request a card");
            return;
        }

        setIsSubmitting(true);
        try {
            const { error } = await supabase
                .from("card_requests")
                .insert([
                    {
                        name_on_card: nameOnCard,
                        email: user.email,
                        user_id: user.user_id,
                    },
                ]);

            if (error) throw error;

            toast.success("Flex Card request submitted! Your requested will be processed within 12-24 hours.");
            setNameOnCard("");
            setUnderstood(false);
            onClose();
        } catch (err) {
            console.error("Error submitting card request:", err);
            toast.error("Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <Drawer open={isOpen} onOpenChange={onClose}>
            <DrawerContent className="bg-[#050505] border-[#505050] text-white rounded-t-2xl">
                <DrawerHeader>
                    <DrawerTitle className="text-white/90 text-base font-medium text-left">
                        Get Flex Card
                    </DrawerTitle>
                </DrawerHeader>

                <div className="px- space-y-3 mt-3">
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">Name on Card</label>
                        <Input
                            value={nameOnCard}
                            onChange={(e) => setNameOnCard(e.target.value)}
                            placeholder="Jnr Isamil"
                            className="bg-[#1a1a1a] border-[#333] py-6 text-white placeholder:text-gray-500 focus:none"
                        />
                    </div>

                    <div className="p-3 bg-[#1a1a1a] rounded-lg border border-[#333]">
                        <p className="text-xs text-gray-400 flex gap-2">
                            <InfoIcon size={24} />
                            Card creation fee is $1 and will be deducted from the first deposit on your flex wallet.
                        </p>
                    </div>

                </div>

                <DrawerFooter>
                    <Button
                        onClick={handleRequest}
                        disabled={!nameOnCard.trim() || isSubmitting}
                        className="w-full bg-[#C7EF6B] hover:bg-[#B8E55A] text-black font-medium py-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Submitting..
                            </>
                        ) : (
                            "Request Card"
                        )}
                    </Button>

                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
};
