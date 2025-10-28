import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, CircleQuestionMark } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { mockLearnContent } from "@/mock/learn";
import { extractVimeoId, getVimeoEmbedUrl } from "@/utils/vimeo";

const learnContent = mockLearnContent;

export const LearnDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { contentId } = useParams<{ contentId: string }>();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const [currentHighlight, setCurrentHighlight] = useState(0);
  const content = learnContent.find((c) => c.id === contentId);
  const vimeoId = useMemo(() => {
    if (content?.videoUrl) return extractVimeoId(content.videoUrl) || undefined;
    return undefined;
  }, [content?.videoUrl]);

  const embedUrl = useMemo(() => {
    if (!vimeoId) return undefined;
    return getVimeoEmbedUrl(vimeoId, {
      autoplay: false,
      muted: false,
      loop: false,
      controls: true,
      title: false,
      portrait: false,
      byline: false,
    });
  }, [vimeoId]);
  if (!content) {
    return (
      <div className="h-screen bg-[#050505] text-white flex items-center justify-center">
        <p>Content not found</p>
      </div>
    );
  }

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleHelpClick = () => {
    setShowHelpDrawer(true);
  };

  // Split content into sentences for highlighting
  const contentSentences = content.fullContent
    .split(". ")
    .map((sentence) => sentence.trim() + (sentence.endsWith(".") ? "" : "."));

  const handleReset = () => {
    setCurrentHighlight(0);
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

        <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#86B3F7" size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 scrollbar-hide">
       
        <div className="relative w-full bg-black rounded-xl mb-6 overflow-hidden">
          {/* 16:9 aspect ratio */}
          <div className="pt-[56.25%]" />
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title="Vimeo player"
              className="absolute inset-0 w-full h-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gray-700 flex items-center justify-center text-gray-400 text-sm">
              Video unavailable
            </div>
          )}
        </div>

        {/* Content Text */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">{content.title}</h2>
          <p className="text-gray-400 text-sm">{content.subtitle}</p>

          {/* Script with highlighting */}
          <div className="space-y-3">
            <div className=" max-h-96 overflow-y-auto scrollbar-hide">
              {contentSentences.map((sentence, index) => (
                <span
                  key={index}
                  className={`text-sm leading-relaxed transition-all duration-500 ${
                    index === currentHighlight
                      ? "text-[#C7EF6B] bg-[#C7EF6B]/10 px-0.5 py-1 rounded"
                      : "text-gray-300"
                  }`}
                >
                  {sentence}
                  {index < contentSentences.length - 1 ? " " : ""}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Help Drawer */}
      <HelpDrawer
        isOpen={showHelpDrawer}
        onClose={() => setShowHelpDrawer(false)}
        title="Video Guide"
        content={[
          "Watch the video and follow along with the highlighted script to learn about Lisar and crypto.",
          "Use the player's controls to play or pause as needed.",
          "You can read the script without watching the video if you prefer."
        ]}
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/learn" />
    </div>
  );
};
