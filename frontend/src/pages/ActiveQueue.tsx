import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Layers, User, LogOut, Bell } from "lucide-react";
import GetReady from "../components/GetReady";

export default function ActiveQueue() {
  const { queueNumber } = useParams<{ queueNumber: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Get company name from location state or use a default
  const companyName = location.state?.companyName || "Queue";
  const [timeAgo, setTimeAgo] = useState("10s ago");
  
  // State to control GetReady component visibility
  const [showGetReady, setShowGetReady] = useState(false);
  const [peopleAhead, setPeopleAhead] = useState(5);

  // Format queue number to match design (A-154 format)
  const formattedQueueNumber = queueNumber ? `A-${queueNumber}` : "N/A";

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = Math.floor(Math.random() * 60);
      setTimeAgo(`${seconds}s ago`);
      
      // Simulate queue progression - decrease people ahead
      setPeopleAhead((prev) => {
        const newValue = Math.max(0, prev - 1);
        // Show GetReady when 3 or fewer people ahead
        if (newValue <= 3 && newValue > 0) {
          setShowGetReady(true);
        }
        return newValue;
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // Mock queue data - ensure user's number is in the list
  const liveQueue = [
    { number: "A-147", status: "serving" },
    { number: "A-148", status: "next" },
    { number: "A-149", status: "next" },
    { number: "A-150", status: "next" },
    { number: "A-151", status: "waiting" },
    { number: "A-152", status: "waiting" },
    { number: "A-153", status: "waiting" },
    { number: formattedQueueNumber, status: "yours" },
  ];

  // Show GetReady component if conditions are met
  if (showGetReady) {
    return (
      <GetReady
        queueNumber={formattedQueueNumber}
        companyName={companyName}
        peopleAhead={peopleAhead}
        onClose={() => setShowGetReady(false)}
      />
    );
  }

  return (
    <div className="bg-gray-50">
      <header className="flex justify-between items-center px-8 py-6 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center text-primary">
            <Layers size={24} className="fill-current" />
          </div>
          <span className="text-xl font-bold text-gray-900">QueueFix</span>
        </div>

        <button className="w-10 h-10 rounded-full bg-gray-50 text-gray-900 flex items-center justify-center transition-all duration-150 hover:bg-gray-200">
          <User size={20} />
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-12">
          {companyName}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="flex flex-col gap-6 lg:order-1">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-sm font-semibold text-gray-900 mb-6 uppercase tracking-wider">
                Your Number
              </h2>
              <div className="text-6xl font-bold text-blue-500 text-center py-6 bg-gray-50 rounded-xl">
                {formattedQueueNumber}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Queue is moving...
              </h3>
              <p className="text-sm text-gray-400 mb-2">updated {timeAgo}</p>
              <p className="text-sm text-gray-600">Approx. 25 minutes wait</p>
              <p className="text-sm text-gray-600 mt-2">People ahead: {peopleAhead}</p>
            </div>

            <button
              onClick={() => navigate("/")}
              className="w-full py-3.5 bg-red-500 text-white rounded-lg text-base font-semibold flex items-center justify-center gap-2 transition-all duration-150 hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-md"
            >
              <LogOut size={20} />
              Leave Queue
            </button>

            <button className="w-full py-3.5 bg-blue-100 text-primary rounded-lg text-base font-semibold flex items-center justify-center gap-2 transition-all duration-150 hover:bg-blue-200">
              <Bell size={20} />
              Notifications
            </button>
            
            {/* Debug button to test GetReady component */}
            <button
              onClick={() => setShowGetReady(true)}
              className="w-full py-3.5 bg-orange-500 text-white rounded-lg text-base font-semibold flex items-center justify-center gap-2 transition-all duration-150 hover:bg-orange-600"
            >
              Test Get Ready View
            </button>
          </div>

          <div className="lg:col-span-2 lg:order-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm ">
              <h2 className="text-sm font-semibold text-gray-900 mb-6 uppercase tracking-wider">
                Live Queue
              </h2>

              <div className="flex flex-col gap-2  ">
                {liveQueue.map((item, index) => (
                  <div
                    key={index}
                    className={`flex justify-between items-center px-6 py-4 rounded-lg transition-all duration-150 border border-gray-200 ${
                      item.status === "serving"
                        ? "bg-green-50 border-2 border-green-500"
                        : item.status === "next"
                        ? "bg-blue-50"
                        : item.status === "yours"
                        ? "bg-blue-50 border-2 border-blue-500"
                        : "bg-white"
                    }`}
                  >
                    <span
                      className={`text-lg font-semibold ${
                        item.status === "serving"
                          ? "text-green-600"
                          : "text-gray-900"
                      }`}
                    >
                      {item.number}
                    </span>
                    {item.status === "serving" && (
                      <span className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-green-500 text-white">
                        Now Serving
                      </span>
                    )}
                    {item.status === "next" && (
                      <span className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-100 text-blue-500">
                        Up Next
                      </span>
                    )}
                    {item.status === "yours" && (
                      <span className="px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-blue-100 text-blue-500">
                        Your Position
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
