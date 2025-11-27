import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layers, Clock, Users, ArrowRight, AlertCircle } from "lucide-react";
import { getActiveQueues } from "../api/companies.api";
import type { ActiveQueue } from "../types/company";
import { getCompanyById } from "../api/companies.api";

export default function MyQueues() {
  const navigate = useNavigate();
  const phoneNumber = localStorage.getItem("phoneNumber") || "";
  const [activeQueues, setActiveQueues] = useState<ActiveQueue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActiveQueues = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getActiveQueues(phoneNumber);

        if (result.success && result.data) {
          setActiveQueues(result.data);
        } else {
          setError(result.message || "Failed to fetch active queues");
        }
      } catch (err) {
        setError("Failed to load active queues. Please try again.");
        console.error("Error fetching active queues:", err);
      } finally {
        setLoading(false);
      }
    };

    if (phoneNumber) {
      fetchActiveQueues();
    } else {
      setLoading(false);
    }
  }, [phoneNumber]);

  const handleQueueClick = async (queue: ActiveQueue) => {
    try {
      // Fetch company details to get logo
      const companyResult = await getCompanyById(queue.companyId);
      if (companyResult.success && companyResult.data) {
        const company = companyResult.data.data || companyResult.data;
        navigate(`/queue/${queue.queueNumber}`, {
          state: {
            companyId: queue.companyId,
            companyName: queue.companyName,
            companyLogo: company.imageUrl || "",
          },
        });
      } else {
        // Fallback if company fetch fails
        navigate(`/queue/${queue.queueNumber}`, {
          state: {
            companyId: queue.companyId,
            companyName: queue.companyName,
            companyLogo: "",
          },
        });
      }
    } catch (err) {
      console.error("Error fetching company details:", err);
      navigate(`/queue/${queue.queueNumber}`, {
        state: {
          companyId: queue.companyId,
          companyName: queue.companyName,
          companyLogo: "",
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="flex justify-between items-center px-8 py-6 bg-white border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 flex items-center justify-center text-primary">
            <Layers size={24} className="fill-current" />
          </div>
          <span className="text-xl font-bold text-gray-900">Queue Smart</span>
        </div>
        <button
          onClick={() => navigate("/")}
          className="text-gray-600 hover:text-gray-900"
        >
          Browse Companies
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            My Active Queues
          </h1>
          <p className="text-gray-600 text-lg">
            View and manage all your active queue positions
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <p className="text-gray-500 text-lg">Loading your queues...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="text-red-500" size={20} />
              <p className="text-red-600 font-semibold">Error</p>
            </div>
            <p className="text-red-600">{error}</p>
          </div>
        ) : activeQueues.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-200 text-center">
            <Users className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Active Queues
            </h3>
            <p className="text-gray-600 mb-6">
              You're not currently in any queues. Browse companies to join one!
            </p>
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              Browse Companies
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeQueues.map((queue) => (
              <div
                key={queue.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 cursor-pointer transition-all duration-150 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30"
                onClick={() => handleQueueClick(queue)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {queue.companyName}
                    </h3>
                    <div className="flex items-center gap-6 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-bold text-lg">
                            {queue.queueNumber}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Queue Number</p>
                          <p className="text-sm font-semibold text-gray-900">
                            Position #{queue.position}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Users size={18} />
                        <div>
                          <p className="text-xs text-gray-500">People Ahead</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {queue.peopleAhead}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={18} />
                        <div>
                          <p className="text-xs text-gray-500">Est. Wait</p>
                          <p className="text-sm font-semibold text-gray-900">
                            ~{queue.estimatedWaitMinutes} min
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <ArrowRight
                    className="text-gray-400 shrink-0 ml-4"
                    size={24}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
