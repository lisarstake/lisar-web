import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, CircleQuestionMark } from "lucide-react";
import { HelpDrawer } from "@/components/general/HelpDrawer";
import { BottomNavigation } from "@/components/general/BottomNavigation";
import { mockLearnContent, LearnContent } from "@/mock/learn";
import { useVimeoPlayer } from "@/hooks/useVimeoPlayer";

const learnContent = mockLearnContent;

const findNextVideoInCategory = (
  currentContent: LearnContent
): LearnContent | null => {
  const currentIndex = learnContent.findIndex(
    (c) => c.id === currentContent.id
  );
  if (currentIndex === -1) return null;

  for (let i = currentIndex + 1; i < learnContent.length; i++) {
    if (learnContent[i].category === currentContent.category) {
      return learnContent[i];
    }
  }

  return null;
};

export const LearnDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const [showHelpDrawer, setShowHelpDrawer] = useState(false);
  const content = learnContent.find((c) => c.slug === slug);

  const handleVideoEnded = () => {
    if (!content) return;
    const nextVideo = findNextVideoInCategory(content);
    if (nextVideo) {
      navigate(`/learn/${nextVideo.slug}`);
    }
  };

  if (!content) {
    return (
      <div className="h-screen bg-[#050505] text-white flex items-center justify-center">
        <p>Content not found</p>
      </div>
    );
  }

  const { iframeRef, embedUrl, elapsedTime } = useVimeoPlayer({
    videoUrl: content.videoUrl,
    onEnded: handleVideoEnded,
  });

  const [currentHighlight, setCurrentHighlight] = useState(0);

  const contentSentences = useMemo(() => {
    return content.fullContent
      .split(". ")
      .map((sentence) => sentence.trim() + (sentence.endsWith(".") ? "" : "."));
  }, [content.fullContent]);

  const sentenceWordCounts = useMemo(() => {
    return contentSentences.map((sentence) => {
      return sentence.split(/\s+/).filter((word) => word.length > 0).length;
    });
  }, [contentSentences]);

  const cumulativeWordCounts = useMemo(() => {
    const cumulative: number[] = [];
    let total = 0;
    sentenceWordCounts.forEach((count) => {
      total += count;
      cumulative.push(total);
    });
    return cumulative;
  }, [sentenceWordCounts]);

  const totalWords = useMemo(() => {
    return content.fullContent.split(/\s+/).filter((word) => word.length > 0)
      .length;
  }, [content.fullContent]);

  const wordsPerSecond = useMemo(() => {
    return totalWords / content.duration;
  }, [content.duration, totalWords]);

  useEffect(() => {
    if (!content.duration) return;

    const wordsRead = elapsedTime * wordsPerSecond * content.s_factor;

    let highlightIndex = 0;
    for (let i = 0; i < cumulativeWordCounts.length; i++) {
      if (wordsRead < cumulativeWordCounts[i]) {
        highlightIndex = i;
        break;
      }
      highlightIndex = i + 1;
    }

    highlightIndex = Math.min(highlightIndex, contentSentences.length - 1);
    setCurrentHighlight(highlightIndex);

    if (elapsedTime === 0) {
      setCurrentHighlight(0);
    }
  }, [
    elapsedTime,
    wordsPerSecond,
    cumulativeWordCounts,
    contentSentences.length,
    content.duration,
    content.s_factor,
  ]);

  const handleBackClick = () => {
    navigate(-1);
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

        <button
          onClick={handleHelpClick}
          className="w-8 h-8 bg-[#2a2a2a] rounded-full flex items-center justify-center"
        >
          <CircleQuestionMark color="#86B3F7" size={16} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 scrollbar-hide pb-10">
        <div className="relative w-full bg-black rounded-xl mb-6 overflow-hidden">
          {/* 16:9 aspect ratio */}
          <div className="pt-[56.25%]" />
          {embedUrl ? (
            <iframe
              ref={iframeRef}
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
            <div className="max-h-96 overflow-y-auto scrollbar-hide">
              {contentSentences.map((sentence, index) => (
                <span
                  key={index}
                  className={`text-sm leading-relaxed transition-all duration-500 ${
                    index === currentHighlight
                      ? "text-[#C7EF6B] bg-[#C7EF6B]/10 px-0.5 py-1 rounded"
                      : index < currentHighlight
                        ? "text-gray-400"
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
          "You can read the script without watching the video if you prefer.",
        ]}
      />

      {/* Bottom Navigation */}
      <BottomNavigation currentPath="/learn" />
    </div>
  );
};
