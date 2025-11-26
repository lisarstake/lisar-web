import React from 'react';
import { Info } from 'lucide-react';
import { useGuidedTour } from '@/hooks/useGuidedTour';
import { WALLET_TOUR_ID } from '@/lib/tourConfig';

interface TourButtonProps {
  variant?: 'icon' | 'full';
  className?: string;
}

/**
 * A button component to start or restart the guided tour.
 * Can be used in settings, profile, or anywhere you want to give users access to the tour.
 */
export const TourButton: React.FC<TourButtonProps> = ({ 
  variant = 'full',
  className = '' 
}) => {
  const { startTour, isCompleted } = useGuidedTour({
    tourId: WALLET_TOUR_ID,
    autoStart: false,
  });

  if (variant === 'icon') {
    return (
      <button
        onClick={startTour}
        className={`w-10 h-10 bg-[#C7EF6B]/10 rounded-full flex items-center justify-center hover:bg-[#C7EF6B]/20 transition-colors cursor-pointer border border-[#C7EF6B]/30 ${className}`}
        title={isCompleted ? 'Restart guided tour' : 'Start guided tour'}
      >
        <Info size={16} color="#C7EF6B" />
      </button>
    );
  }

  return (
    <button
      onClick={startTour}
      className={`flex items-center gap-2 px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition-colors ${className}`}
    >
      <Info size={18} color="#C7EF6B" />
      <span className="text-gray-300 text-sm">
        {isCompleted ? 'Restart Tour' : 'Start Tour'}
      </span>
    </button>
  );
};

