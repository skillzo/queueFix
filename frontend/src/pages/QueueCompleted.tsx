import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Star } from "lucide-react";
import Button from "../components/Button";

export default function QueueCompleted() {
  const navigate = useNavigate();
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleLeaveFeedback = () => {
    // Could navigate to a detailed feedback form
    console.log("Leave feedback clicked with rating:", rating);
  };

  const handleStarClick = (starValue: number) => {
    setRating(starValue);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50/30 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
          {/* Success Icon */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl"></div>
              <div className="relative bg-green-500 rounded-full p-5">
                <Check size={48} className="text-white" strokeWidth={3} />
              </div>
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Queue Completed
          </h1>
          <p className="text-gray-600 text-base mb-8">
            Thank you for using Queue Smart. Your turn is over.
          </p>

          {/* Rating Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              How was your experience?
            </h2>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((starValue) => (
                <button
                  key={starValue}
                  onClick={() => handleStarClick(starValue)}
                  onMouseEnter={() => setHoveredRating(starValue)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform duration-150 hover:scale-110 focus:outline-none"
                >
                  <Star
                    size={36}
                    className={`transition-colors duration-150 ${
                      starValue <= (hoveredRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-300 text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleBackToHome}
            >
              Back to Home
            </Button>
            <Button
              variant="outline"
              size="lg"
              fullWidth
              onClick={handleLeaveFeedback}
            >
              Leave Feedback
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
