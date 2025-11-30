import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Layers, User, LogOut, Armchair } from "lucide-react";
import GetReady from "../components/GetReady";
import {
  getQueueList,
  getQueuePosition,
  leaveQueue,
} from "../api/companies.api";
import { useQueueSocket } from "../hooks/useQueueSocket";

interface QueueListItem {
  queueNumber: string;
  fullName: string;
  position: number;
  phoneNumber?: string;
}

export default function ActiveQueue() {
  const navigate = useNavigate();
  const location = useLocation();

  const companyId = location.state?.companyId;
  const companyName = location.state?.companyName || "Queue";
  const companyLogo = location.state?.companyLogo || "";
  const phoneNumber = localStorage.getItem("phoneNumber") || "";

  const [queueList, setQueueList] = useState<QueueListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userQueueNumber, setUserQueueNumber] = useState<string>("");
  const [peopleAhead, setPeopleAhead] = useState(0);
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showGetReady, setShowGetReady] = useState(false);
  const previousQueueRef = useRef<QueueListItem[]>([]);

  const fetchData = useCallback(async () => {
    if (!companyId || !phoneNumber) {
      setError("Missing company ID or phone number");
      setLoading(false);
      return;
    }

    try {
      const [listResult, positionResult] = await Promise.all([
        getQueueList(companyId, 200),
        getQueuePosition(companyId, phoneNumber),
      ]);

      if (listResult.success && listResult.data) {
        const sortedQueue = [...listResult.data].sort(
          (a, b) => a.position - b.position
        );

        // Check if queue changed for animation
        const previousQueueNumbers = previousQueueRef.current.map(
          (item) => item.queueNumber
        );
        const currentQueueNumbers = sortedQueue.map((item) => item.queueNumber);
        const queueChanged =
          previousQueueNumbers.length !== currentQueueNumbers.length ||
          previousQueueNumbers.some(
            (num, idx) => num !== currentQueueNumbers[idx]
          );

        if (queueChanged && previousQueueRef.current.length > 0) {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 600);
        }

        previousQueueRef.current = sortedQueue;
        setQueueList(sortedQueue);
      }

      if (positionResult.success && positionResult.data) {
        setUserQueueNumber(positionResult.data.queueNumber);
        setPeopleAhead(positionResult.data.peopleAhead);
        setUserPosition(positionResult.data.position);

        // Show GetReady if user is in top 10, hide if not
        if (positionResult.data.position <= 10) {
          setShowGetReady(true);
        } else {
          setShowGetReady(false);
        }
      }

      setError(null);
    } catch (err: any) {
      setError("Failed to load queue data");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  }, [companyId, phoneNumber]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle WebSocket updates
  const handleQueueUpdate = useCallback(
    (data: any) => {
      console.log("Queue update received:", data);

      if (data.type === "QUEUE_EMPTIED") {
        setQueueList([]);
        setUserQueueNumber("");
        setPeopleAhead(0);
        setUserPosition(null);
        setShowGetReady(false);
        return;
      }

      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);
      fetchData();
    },
    [fetchData]
  );

  // Connect to WebSocket for real-time updates
  useQueueSocket({
    companyId,
    onUpdate: handleQueueUpdate,
    enabled: !!companyId,
  });

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
      setError("Failed to leave queue");
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
        <p className="text-gray-500">Loading...</p>
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
    <div className="bg-gray-50 min-h-screen">
      <header className="flex justify-between items-center px-8 py-6 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center text-primary">
            <Layers size={24} className="fill-current" />
          </div>
          <span className="text-xl font-bold text-gray-900">Queue Smart</span>
        </div>
        <button className="w-10 h-10 rounded-full bg-gray-50 text-gray-900 flex items-center justify-center">
          <User size={20} />
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="flex items-center gap-2 mb-8">
          {companyLogo && (
            <img src={companyLogo} alt={companyName} className="w-10 h-10" />
          )}
          <h1 className="text-4xl font-bold text-gray-900">{companyName}</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:order-1">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-6">
              <h2 className="text-sm font-semibold text-gray-900 mb-6 uppercase">
                Your Number
              </h2>
              <div className="text-6xl font-bold text-blue-500 text-center py-6 bg-gray-50 rounded-xl">
                {userQueueNumber || "N/A"}
              </div>
            </div>

            <button
              onClick={handleLeaveQueue}
              className="w-full py-3.5 bg-red-500 text-white rounded-lg text-base font-semibold flex items-center justify-center gap-2 hover:bg-red-600"
            >
              <LogOut size={20} />
              Leave Queue
            </button>
          </div>

          <div className="lg:col-span-2 lg:order-2">
            <div className="bg-white rounded-2xl p-8 shadow-sm">
              <h2 className="text-sm font-semibold text-gray-900 mb-6 uppercase tracking-wider">
                Live Queue
              </h2>

              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
                {queueList.length === 0 ? (
                  <div className="col-span-full">
                    <p className="text-gray-500 text-center py-8">
                      No one in queue
                    </p>
                  </div>
                ) : (
                  queueList.map((item, index) => (
                    <div
                      key={item.queueNumber}
                      className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all duration-150 ${
                        isAnimating ? "animate-slide-left" : ""
                      } ${
                        item.queueNumber === userQueueNumber
                          ? "bg-rose-50 border-rose-500"
                          : "bg-white border-gray-200"
                      }`}
                      title={item.queueNumber}
                      style={{
                        animationDelay: isAnimating
                          ? `${Math.min(index * 15, 200)}ms`
                          : "0ms",
                      }}
                    >
                      {item.queueNumber === userQueueNumber && (
                        <p className="text-xs font-semibold text-rose-600">
                          You
                        </p>
                      )}
                      <Armchair
                        size={32}
                        className={
                          item.queueNumber === userQueueNumber
                            ? "text-rose-600"
                            : "text-gray-400"
                        }
                      />
                      <span
                        className={`text-xs font-semibold mt-2 ${
                          item.queueNumber === userQueueNumber
                            ? "text-rose-600"
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
