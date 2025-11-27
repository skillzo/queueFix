import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layers, User, LogOut, Bell, Armchair } from "lucide-react";
import GetReady from "../components/GetReady";
import {
  getQueueList,
  getQueuePosition,
  leaveQueue,
  getQueueStatus,
} from "../api/companies.api";
import { useQueueSocket } from "../hooks/useQueueSocket";

interface QueueListItem {
  queueNumber: string;
  fullName: string;
  position: number;
  phoneNumber?: string;
  status?: string;
}

// Helper function for status determination
const getQueueItemStatus = (
  item: QueueListItem,
  userQueueNumber: string,
  minPosition: number,
  servingNumber: number
): string => {
  if (item.queueNumber === userQueueNumber) return "yours";
  if (item.position === minPosition) return "highest";
  if (item.position === servingNumber) return "serving";
  if (item.position >= servingNumber + 1 && item.position <= servingNumber + 3)
    return "next";
  return "waiting";
};

// Helper function for status styles
const getStatusStyles = (status: string) => {
  const styles = {
    yours: "bg-rose-50 border-rose-500",
    highest: "bg-green-50 border-green-500",
    serving: "bg-green-50 border-green-500",
    next: "bg-blue-50 border-blue-300",
    waiting: "bg-white border-gray-200",
  };
  return styles[status as keyof typeof styles] || styles.waiting;
};

const getStatusColor = (status: string) => {
  const colors = {
    yours: "text-rose-600",
    highest: "text-green-600",
    serving: "text-green-600",
    next: "text-blue-500",
    waiting: "text-gray-400",
  };
  return colors[status as keyof typeof colors] || colors.waiting;
};

export default function ActiveQueue() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get company info from location state
  const companyId = location.state?.companyId;
  const companyName = location.state?.companyName || "Queue";
  const companyLogo = location.state?.companyLogo || "";
  const phoneNumber = localStorage.getItem("phoneNumber") || "";

  const [liveQueue, setLiveQueue] = useState<QueueListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showGetReady, setShowGetReady] = useState(false);
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(0);
  const [userQueueNumber, setUserQueueNumber] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState(false);
  const previousQueueRef = useRef<QueueListItem[]>([]);

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

      const statusData =
        statusResult.success && statusResult.data
          ? (statusResult.data as any).data || statusResult.data
          : null;
      const servingNumber = statusData?.currentServing || 0;

      let currentUserQueueNumber = "";
      if (positionResult.success && positionResult.data) {
        currentUserQueueNumber = positionResult.data.queueNumber;
        setUserQueueNumber(positionResult.data.queueNumber);
        setPeopleAhead(positionResult.data.peopleAhead);
        setEstimatedWait(positionResult.data.estimatedWaitMinutes);

        if (
          positionResult.data.peopleAhead <= 3 &&
          positionResult.data.peopleAhead > 0
        ) {
          setShowGetReady(true);
        }
      }

      if (listResult.success && listResult.data) {
        const minPosition = Math.min(
          ...listResult.data.map((item) => item.position)
        );

        const queueWithStatus = listResult.data.map((item) => ({
          ...item,
          status: getQueueItemStatus(
            item,
            currentUserQueueNumber,
            minPosition,
            servingNumber
          ),
        }));

        // Check if queue changed (items added/removed)
        const previousQueueNumbers = previousQueueRef.current.map(
          (item) => item.queueNumber
        );
        const currentQueueNumbers = queueWithStatus.map(
          (item) => item.queueNumber
        );
        const queueChanged =
          previousQueueNumbers.length !== currentQueueNumbers.length ||
          previousQueueNumbers.some(
            (num, idx) => num !== currentQueueNumbers[idx]
          );

        if (queueChanged && previousQueueRef.current.length > 0) {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 600); // Match CSS animation duration
        }

        previousQueueRef.current = queueWithStatus;
        setLiveQueue(queueWithStatus);
      }

      setError(null);
    } catch (err: any) {
      setError("Failed to load queue data. Please try again.");
      console.error("Error fetching queue data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle WebSocket updates
  const handleQueueUpdate = useCallback(
    (data: any) => {
      console.log("Queue update received in ActiveQueue:", data);

      // Handle queue emptied event
      if (data.type === "QUEUE_EMPTIED") {
        setLiveQueue([]);
        setUserQueueNumber("");
        setPeopleAhead(0);
        setEstimatedWait(0);
        setShowGetReady(false);
        // Still refresh to get latest state
        fetchQueueData();
        return;
      }

      // Trigger animation and refresh queue data
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
      fetchQueueData();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Connect to WebSocket for real-time updates
  useQueueSocket({
    companyId,
    onUpdate: handleQueueUpdate,
    enabled: !!companyId,
  });

  useEffect(() => {
    if (companyId && phoneNumber) {
      fetchQueueData();
    } else {
      setLoading(false);
      setError("Missing required information");
    }
  }, [companyId, phoneNumber]);

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

  if (showGetReady) {
    return (
      <GetReady
        queueNumber={userQueueNumber || "N/A"}
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

      <div className="max-w-7xl mx-auto px-8 py-12 ">
        <div className="flex items-center gap-2 mb-12">
          <img src={companyLogo} alt={companyName} className="w-10 h-10" />

          <h1 className="text-4xl font-bold text-gray-900 ">{companyName}</h1>
        </div>

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
                {userQueueNumber || "N/A"}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                Queue is moving...
              </h3>
              <p className="text-sm text-gray-400 mb-2">updated just now</p>
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
                      key={item.queueNumber}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 ${
                        isAnimating
                          ? "animate-slide-left"
                          : "transition-all duration-150"
                      } ${getStatusStyles(item.status || "waiting")}`}
                      title={item.queueNumber}
                      style={{
                        animationDelay: isAnimating
                          ? `${Math.min(index * 15, 200)}ms`
                          : "0ms",
                      }}
                    >
                      {item.status === "yours" && (
                        <p className="text-xs font-semibold text-rose-600">
                          You
                        </p>
                      )}
                      <Armchair
                        size={32}
                        className={getStatusColor(item.status || "waiting")}
                      />
                      <span
                        className={`text-xs font-semibold mt-2 transition-colors duration-150 ${
                          item.status === "yours" ||
                          item.status === "highest" ||
                          item.status === "serving"
                            ? getStatusColor(item.status)
                            : "text-gray-600"
                        }`}
                      >
                        {item.queueNumber}
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
