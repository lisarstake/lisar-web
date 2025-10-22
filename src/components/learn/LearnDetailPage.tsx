import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, CircleQuestionMark } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";

export const LearnDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId: string }>();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);

  const handleBackClick = () => {
    navigate("/learn");
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-8">
        <button
          onClick={handleBackClick}
          className="w-8 h-8 flex items-center justify-center"
        >
          <ChevronLeft color="#C7EF6B" />
        </button>

        <h1 className="text-lg font-medium text-white">Lisar Onboarding</h1>

        <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#86B3F7" size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6">
        {/* Image Placeholder */}
        <div className="w-full h-64 bg-gray-600 rounded-xl mb-6 flex items-center justify-center">
          <span className="text-gray-400 text-sm">Image Placeholder</span>
        </div>

        {/* Content Text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">What is Lisar?</h2>
          
          <div className="space-y-3">
            <p className="text-gray-300 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet consectetur. Quam sed dictum amet eu convallis eu. 
              Ac sit ultricies leo cras. Convallis lectus diam purus interdum habitant. 
              Sit vestibulum in orci ut non sit. Blandit lectus id sed pulvinar risus purus adipiscing placerat.
            </p>
            
            <p className="text-gray-300 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet consectetur. Quam sed dictum amet eu convallis eu. 
              Ac sit ultricies leo cras. Convallis lectus diam purus interdum habitant. 
              Sit vestibulum in orci ut non sit. Blandit lectus id sed pulvinar risus purus adipiscing placerat.
            </p>
            
            <p className="text-gray-300 text-sm leading-relaxed">
              Lorem ipsum dolor sit amet consectetur. Quam sed dictum amet eu convallis eu. 
              Ac sit ultricies leo cras. Convallis lectus diam purus interdum habitant. 
              Sit vestibulum in orci ut non sit. Blandit lectus id sed pulvinar risus purus adipiscing placerat.
            </p>
          </div>
        </div>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="About Lisar"
        subtitle="A quick guide on how to use the learn content"
        content={[
          "Lorem ipsum dolor sit amet consectetur. Quam sed dictum amet eu convallis eu. Ac sit ultricies leo cras. Convallis lectus diam purus interdum habitant. Sit vestibulum in orci ut non sit. Blandit lectus id sed pulvinar risus purus adipiscing placerat."
        ]}
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/learn" />
    </div>
  );
};
