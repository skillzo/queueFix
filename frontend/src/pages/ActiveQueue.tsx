import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layers, User, LogOut, Bell, Armchair } from "lucide-react";
import GetReady from "../components/GetReady";
import {
  getQueueList,
  getQueuePosition,
  leaveQueue,
  getQueueStatus,
} from "../api/companies.api";

interface QueueListItem {
  queueNumber: string;
  fullName: string;
  position: number;
  phoneNumber?: string;
  status?: string;
  number?: string;
}

export default function ActiveQueue() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get company info from location state
  const companyName = location.state?.companyName || "Queue";
  const companyId = location.state?.companyId;
  const phoneNumber = localStorage.getItem("phoneNumber") || "";

  const [liveQueue, setLiveQueue] = useState<QueueListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeAgo, setTimeAgo] = useState("Just now");
  const [showGetReady, setShowGetReady] = useState(false);
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(0);
  const [userQueueNumber, setUserQueueNumber] = useState<string>("");

  // Use queue number from API response
  const formattedQueueNumber = userQueueNumber || "N/A";

  // Fetch queue data
  const fetchQueueData = async () => {
    if (!companyId || !phoneNumber) {
      setError("Missing company ID or phone number");
      setLoading(false);
      return;
    }

    try {
      const [listResult, positionResult, statusResult] = await Promise.all([
        getQueueList(companyId, 200),
        getQueuePosition(companyId, phoneNumber),
        getQueueStatus(companyId),
      ]);

      let servingNumber = 0;
      if (statusResult.success && statusResult.data) {
        // Handle ApiResponse structure (data.data) or ServiceResponse (data)
        const statusData = (statusResult.data as any).data || statusResult.data;
        servingNumber = statusData?.currentServing || 0;
      }

      if (listResult.success && listResult.data) {
        // Find the highest priority user (lowest position number)
        const minPosition = Math.min(
          ...listResult.data.map((item) => item.position)
        );

        // Determine status for each queue item
        const queueWithStatus = listResult.data.map((item) => {
          const position = item.position;
          let status = "waiting";

          if (position === minPosition) {
            status = "highest";
          } else if (position === servingNumber) {
            status = "serving";
          } else if (
            position === servingNumber + 1 ||
            position === servingNumber + 2 ||
            position === servingNumber + 3
          ) {
            status = "next";
          } else if (item.queueNumber === userQueueNumber) {
            status = "yours";
          }

          return { ...item, status, number: item.queueNumber };
        });

        setLiveQueue(queueWithStatus);
      }

      if (positionResult.success && positionResult.data) {
        setPeopleAhead(positionResult.data.peopleAhead);
        setEstimatedWait(positionResult.data.estimatedWaitMinutes);
        setUserQueueNumber(positionResult.data.queueNumber);

        // Show GetReady when 3 or fewer people ahead
        if (
          positionResult.data.peopleAhead <= 3 &&
          positionResult.data.peopleAhead > 0
        ) {
          setShowGetReady(true);
        }
      }

      setTimeAgo("Just now");
      setError(null);
    } catch (err: any) {
      setError("Failed to load queue data. Please try again.");
      console.error("Error fetching queue data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch only
  useEffect(() => {
    if (companyId && phoneNumber) {
      fetchQueueData();
    } else {
      setLoading(false);
      setError("Missing required information");
    }
  }, [companyId, phoneNumber]);

  // Update time ago display
  useEffect(() => {
    let lastUpdate = Date.now();
    const timeInterval = setInterval(() => {
      const seconds = Math.floor((Date.now() - lastUpdate) / 1000);
      if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`);
      } else {
        setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
      }
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  const handleLeaveQueue = async () => {
    if (!companyId || !phoneNumber) return;

    if (!confirm("Are you sure you want to leave the queue?")) return;

    try {
      const result = await leaveQueue(companyId, phoneNumber);
      if (result.success) {
        navigate("/");
      } else {
        setError(result.message || "Failed to leave queue");
      }
    } catch (err: any) {
      setError("Failed to leave queue. Please try again.");
      console.error("Error leaving queue:", err);
    }
  };

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

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading queue data...</p>
      </div>
    );
  }

  if (error && !companyId) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-primary text-white rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <header className="flex justify-between items-center px-8 py-6 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center text-primary">
            <Layers size={24} className="fill-current" />
          </div>
          <span className="text-xl font-bold text-gray-900">Queue Smart</span>
        </div>

        <button className="w-10 h-10 rounded-full bg-gray-50 text-gray-900 flex items-center justify-center transition-all duration-150 hover:bg-gray-200">
          <User size={20} />
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-12">
          {companyName}
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

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
              <p className="text-sm text-gray-600">
                Approx. {estimatedWait} minutes wait
              </p>
              <p className="text-sm text-gray-600 mt-2">
                People ahead: {peopleAhead}
              </p>
            </div>

            <button
              onClick={handleLeaveQueue}
              className="w-full py-3.5 bg-red-500 text-white rounded-lg text-base font-semibold flex items-center justify-center gap-2 transition-all duration-150 hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-md"
            >
              <LogOut size={20} />
              Leave Queue
            </button>

            <button className="w-full py-3.5 bg-blue-100 text-primary rounded-lg text-base font-semibold flex items-center justify-center gap-2 transition-all duration-150 hover:bg-blue-200">
              <Bell size={20} />
              Notifications
            </button>
          </div>

          <div className="lg:col-span-2 lg:order-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm ">
              <h2 className="text-sm font-semibold text-gray-900 mb-6 uppercase tracking-wider">
                Live Queue
              </h2>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                {liveQueue.length === 0 ? (
                  <div className="col-span-full">
                    <p className="text-gray-500 text-center py-8">
                      No one in queue
                    </p>
                  </div>
                ) : (
                  liveQueue.map((item, index) => (
                    <div
                      key={index}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all duration-150 border-2 ${
                        item.status === "highest"
                          ? "bg-green-50 border-green-500"
                          : item.status === "serving"
                          ? "bg-green-50 border-green-500"
                          : item.status === "next"
                          ? "bg-blue-50 border-blue-300"
                          : item.status === "yours"
                          ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500"
                          : "bg-white border-gray-200"
                      }`}
                      title={item.number}
                    >
                      <Armchair
                        size={32}
                        className={
                          item.status === "highest"
                            ? "text-green-600"
                            : item.status === "serving"
                            ? "text-green-600"
                            : item.status === "next"
                            ? "text-blue-500"
                            : item.status === "yours"
                            ? "text-blue-600"
                            : "text-gray-400"
                        }
                      />
                      <span
                        className={`text-xs font-semibold mt-2 ${
                          item.status === "highest"
                            ? "text-green-600"
                            : item.status === "serving"
                            ? "text-green-600"
                            : item.status === "yours"
                            ? "text-blue-600"
                            : "text-gray-600"
                        }`}
                      >
                        {item.number}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
