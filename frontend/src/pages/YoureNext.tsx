import { useNavigate, useParams } from "react-router-dom";
import { Bell } from "lucide-react";
import Button from "../components/Button";

export default function YoureNext() {
  const navigate = useNavigate();
  const { queueNumber } = useParams();

  const handleGoToWindow = () => {
    // Navigate to the active queue or completion screen
    navigate(`/queue/${queueNumber}/complete`);
  };

  const handleViewQueueDetails = () => {
    navigate(`/queue/${queueNumber}`);
  };

  const handleNeedHelp = () => {
    // Could navigate to a help/support page
    console.log("Need help clicked");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
          {/* Bell Icon with Animation */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-blue-500 rounded-full p-4 animate-bounce">
                <Bell size={32} className="text-white" strokeWidth={2.5} />
              </div>
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            You're next!
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            Please proceed inside.
          </p>

          {/* Primary Action Button */}
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleGoToWindow}
            className="mb-8"
          >
            Go to Window 3
          </Button>

          {/* Secondary Links */}
          <div className="space-y-3">
            <button
              onClick={handleViewQueueDetails}
              className="text-gray-600 hover:text-blue-500 text-sm font-medium transition-colors underline underline-offset-2"
            >
              View Queue Details
            </button>
            <br />
            <button
              onClick={handleNeedHelp}
              className="text-gray-600 hover:text-blue-500 text-sm font-medium transition-colors underline underline-offset-2"
            >
              Need Help?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
