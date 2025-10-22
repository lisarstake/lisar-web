import { Card } from "./card";

// Simple stakes loader component
export const StakesLoader = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card
          key={i}
          className="border-0 rounded-xl p-4 animate-pulse"
          style={{ background: "#F6FFF9", border: "1px solid #C6F7E2" }}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="text-right">
              <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex gap-2">
              <div className="flex-1 h-8 bg-gray-200 rounded-md"></div>
              <div className="flex-1 h-8 bg-gray-200 rounded-md"></div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );