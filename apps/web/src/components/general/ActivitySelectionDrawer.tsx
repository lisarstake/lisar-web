import React, { useState, useEffect } from "react";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";

interface Activity {
  id: string;
  label: string;
  description: string;
}

interface ActivitySelectionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (selectedActivities: string[]) => void;
  activities: Activity[];
  isSubmitting?: boolean;
}

export const ActivitySelectionDrawer: React.FC<
  ActivitySelectionDrawerProps
> = ({ isOpen, onClose, onSave, activities, isSubmitting = false }) => {
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setSelectedActivities([]);
    }
  }, [isOpen]);

  const toggleActivity = (activityId: string) => {
    setSelectedActivities((prev) => {
      if (prev.includes(activityId)) {
        return prev.filter((id) => id !== activityId);
      } else if (prev.length < 2) {
        return [...prev, activityId];
      }
      return prev;
    });
  };

  const handleSave = () => {
    if (selectedActivities.length === 2) {
      onSave(selectedActivities);
    }
  };

  if (!isOpen) return null;

  const canSave = selectedActivities.length === 2 && !isSubmitting;

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center"
      onClick={onClose}
    >
      <div
        className="bg-[#1a1a1a] rounded-t-3xl w-full max-w-lg animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pt-4 px-4 pb-2">
          <div>
            <h3 className="text-base font-semibold text-white">
              Choose Your Path
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Select 2 out of 3 activities to complete
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {activities.map((activity) => {
            const isSelected = selectedActivities.includes(activity.id);
            const isDisabled = !isSelected && selectedActivities.length >= 2;

            return (
              <button
                key={activity.id}
                onClick={() => !isDisabled && toggleActivity(activity.id)}
                disabled={isDisabled}
                className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? "border-[#C7EF6B] bg-[#C7EF6B]/10"
                    : isDisabled
                      ? "border-gray-700 opacity-50 cursor-not-allowed"
                      : "border-gray-700 hover:border-gray-600"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-0.5">
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-[#C7EF6B]" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`font-semibold text-sm mb-1 ${
                        isSelected ? "text-[#C7EF6B]" : "text-white"
                      }`}
                    >
                      {activity.label}
                    </h4>
                    <p
                      className={`text-xs ${
                        isSelected ? "text-[#C7EF6B]/80" : "text-gray-400"
                      }`}
                    >
                      {activity.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 pb-24">
          <button
            onClick={handleSave}
            disabled={!canSave}
            className={`w-full py-3 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2 ${
              canSave
                ? "bg-[#C7EF6B] text-black hover:bg-[#B8E55A]"
                : "bg-gray-700 text-gray-400 cursor-not-allowed"
            }`}
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSubmitting ? "Saving.." : "Save Selection"}
          </button>
        </div>
      </div>
    </div>
  );
};
