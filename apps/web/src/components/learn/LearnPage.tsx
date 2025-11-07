import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CircleQuestionMark, Play } from "lucide-react";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { mockLearnContent, LearnContent } from "@/mock/learn";
import { extractVimeoId, getVimeoThumbnail } from "@/utils/vimeo";
import { HelpDrawer } from "../general/HelpDrawer";

export const LearnPage: React.FC = () => {
  const navigate = useNavigate();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    "mandatory" | "academy"
  >("academy");

  const learnContent = mockLearnContent;

  const handleContentClick = (slug: string) => {
    navigate(`/learn/${slug}`);
  };

  const handleCategoryChange = (category: "mandatory" | "academy") => {
    setSelectedCategory(category);
  };

  const filteredContent = learnContent.filter(
    (content) => content.category === selectedCategory
  );

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  return (
    <div className="h-screen bg-[#050505] text-white flex flex-col">
      {/* Content List - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-28 scrollbar-hide">
        {/* Header - Now scrollable */}
        <div className="flex items-center justify-between py-8">
          <h1 className="text-lg font-medium text-white">Lisar Academy</h1>

          <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#86B3F7" size={16} />
        </button>
        </div>

        {/* Video Content */}
        <div className="space-y-4">
          {filteredContent.map((content) => (
            <div
              key={content.id}
              onClick={() => handleContentClick(content.slug)}
              className="bg-[#1a1a1a] rounded-xl overflow-hidden cursor-pointer hover:bg-[#2a2a2a] transition-colors"
            >
              {/* Video Thumbnail */}
              <div className="w-full h-44 bg-black relative overflow-hidden">
                {(() => {
                  const vimeoId = extractVimeoId(content.videoUrl);
                  const thumbnailUrl = vimeoId ? getVimeoThumbnail(vimeoId) : null;
                  
                  return thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={content.title}
                      className="w-full h-full object-cover opacity-80"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-600" />
                  );
                })()}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-16 h-16 bg-[#C7EF6B] rounded-full flex items-center justify-center">
                    <Play size={20} color="#000" fill="#000" />
                  </div>
                </div>
              </div>

              {/* Content Info */}
              <div className="p-4">
                <h3 className="text-white font-medium text-lg mb-2">
                    {content.title}
                  </h3>

                <p className="text-gray-500 text-xs leading-relaxed">
                  {content.brief}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fixed Category Filter */}
      <div className="fixed bottom-24 left-0 right-0 px-6 z-10">
        <div className="flex items-center justify-center space-x-2">
          <div className="bg-[#1a1a1a] rounded-full p-1 border border-[#2a2a2a]">
            <button
              onClick={() => handleCategoryChange("mandatory")}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === "mandatory"
                  ? "bg-[#C7EF6B] text-black"
                  : "text-white hover:text-[#C7EF6B]"
              }`}
            >
              Onboarding
            </button>
            <button
              onClick={() => handleCategoryChange("academy")}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === "academy"
                  ? "bg-[#C7EF6B] text-black"
                  : "text-white hover:text-[#C7EF6B]"
              }`}
            >
              Academy
            </button>
          </div>
        </div>
      </div>

        {/* Help Drawer */}
        <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Learning Guide"
        content={[
          "Learn about Lisar and crypto through our academy videos.",
          "Watch the videos and follow along with the highlighted script to learn about Lisar and crypto.",
          "You can read the script without watching the video if you prefer."
        ]}
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/learn" />
    </div>
  );
};
