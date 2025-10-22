import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, CircleQuestionMark } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";

interface LearnContent {
  id: string;
  title: string;
  subtitle: string;
  image: string;
}

export const LearnPage: React.FC = () => {
  const navigate = useNavigate();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);

  const learnContent: LearnContent[] = [
    {
      id: "1",
      title: "Lisar Onboarding",
      subtitle: "How to use the Lisar app",
      image: "/placeholder-image.jpg",
    },
    {
      id: "2",
      title: "Lisar Onboarding",
      subtitle: "How to use the Lisar app",
      image: "/placeholder-image.jpg",
    },
    {
      id: "3",
      title: "Lisar Onboarding",
      subtitle: "How to use the Lisar app",
      image: "/placeholder-image.jpg",
    },
  ];

  const handleContentClick = (contentId: string) => {
    navigate(`/learn-detail/${contentId}`);
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Content List - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-20">
        {/* Header - Now scrollable */}
        <div className="flex items-center justify-between py-8">
          <h1 className="text-lg font-medium text-white">Learn</h1>
        </div>

        <div className="space-y-4">
          {learnContent.map((content) => (
            <div
              key={content.id}
              onClick={() => handleContentClick(content.id)}
              className="bg-[#1a1a1a] rounded-xl overflow-hidden cursor-pointer hover:bg-[#2a2a2a] transition-colors"
            >
              {/* Image Placeholder */}
              <div className="w-full h-48 bg-gray-600 flex items-center justify-center">
                <span className="text-gray-400 text-sm">Image Placeholder</span>
              </div>

              {/* Content Info */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-1">
                    {content.title}
                  </h3>
                  <p className="text-gray-400 text-sm">{content.subtitle}</p>
                </div>

                <div className="ml-4">
                  <ArrowUpRight size={24} color="#C7EF6B" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="About Lisar"
        subtitle="A quick guide on how to use the learn section"
        content={[
          "Lorem ipsum dolor sit amet consectetur. Quam sed dictum amet eu convallis eu. Ac sit ultricies leo cras. Convallis lectus diam purus interdum habitant. Sit vestibulum in orci ut non sit. Blandit lectus id sed pulvinar risus purus adipiscing placerat.",
        ]}
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/learn" />
    </div>
  );
};
