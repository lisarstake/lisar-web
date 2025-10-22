import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const DesktopWarning = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <Card className="text-center border-0 shadow-2xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="pb-6">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <CardTitle className="text-xl font-bold text-gray-900 mb-4">
              Lisar is best on mobile
            </CardTitle>
            <CardDescription className="text-sm text-gray-600 leading-relaxed">
              Lisar is optimized for mobile devices. For the best experience,
              please access this app on your smartphone or tablet.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6"></CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DesktopWarning;
