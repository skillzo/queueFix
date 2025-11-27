import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getDashboardStats, nextCustomer } from "../../api/companies.api";

export default function QueueDashboard() {
  const { companyId } = useParams<{ companyId: string }>();
  const [currentServing, setCurrentServing] = useState(0);
  const [totalWaiting, setTotalWaiting] = useState(0);
  const [servedToday, setServedToday] = useState(0);
  const [avgProcessingTime, setAvgProcessingTime] = useState(0);
  const [waitingList, setWaitingList] = useState<
    Array<{
      queueNumber: string;
      fullName: string;
      position: number;
      phoneNumber?: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingNext, setProcessingNext] = useState(false);

  const fetchDashboardData = async () => {
    if (!companyId) {
      setError("Company ID is required");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getDashboardStats(companyId);

      if (response.success && response.data) {
        setCurrentServing(response.data.currentServing);
        setTotalWaiting(response.data.totalWaiting);
        setServedToday(response.data.servedToday);
        setAvgProcessingTime(response.data.avgProcessingTimeMinutes);
        setWaitingList(response.data.queueList);
      } else {
        setError(response.message || "Failed to load dashboard data");
      }
    } catch (err: any) {
      setError("Failed to load dashboard data. Please try again.");
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 5 seconds
    const interval = setInterval(fetchDashboardData, 5000);
    return () => clearInterval(interval);
  }, [companyId]);

  const handleNextCustomer = async () => {
    if (!companyId || processingNext) return;

    try {
      setProcessingNext(true);
      const response = await nextCustomer(companyId);

      if (response.success && response.data) {
        setCurrentServing(response.data.servingNumber);
        // Refresh dashboard data
        await fetchDashboardData();
      } else {
        setError(response.message || "Failed to serve next customer");
      }
    } catch (err: any) {
      setError("Failed to serve next customer. Please try again.");
      console.error("Error serving next customer:", err);
    } finally {
      setProcessingNext(false);
    }
  };

  const formatTime = (minutes: number): string => {
    if (minutes < 1) return "< 1m";
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    if (secs === 0) {
      return `${mins}m`;
    }
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 px-6 py-4 lg:py-8 sm:px-8 md:px-10  bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4 text-slate-900">
            <div className="size-6 text-[#2b7cee]">
              <svg
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_6_330)">
                  <path
                    clipRule="evenodd"
                    d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
                    fill="currentColor"
                    fillRule="evenodd"
                  ></path>
                </g>
                <defs>
                  <clipPath id="clip0_6_330">
                    <rect fill="white" height="48" width="48"></rect>
                  </clipPath>
                </defs>
              </svg>
            </div>
            <h2 className="text-slate-900 text-xl font-bold leading-tight tracking-[-0.015em]">
              QueueFix
            </h2>
          </div>

          {/* Navigation - Hidden on mobile */}
          <div className="hidden md:flex flex-1 justify-center gap-8"></div>

          {/* User Actions */}
          <div className="flex items-center gap-4"></div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 md:px-10 py-8 bg-[#f6f7f8]">
          <div className="mx-auto max-w-7xl">
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            {loading && !waitingList.length ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-slate-600">Loading dashboard...</p>
              </div>
            ) : (
              <>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-slate-200 bg-white shadow-sm">
                    <p className="text-slate-600 text-base font-medium leading-normal">
                      Total Waiting
                    </p>
                    <p className="text-slate-900 tracking-tight text-4xl font-bold leading-tight">
                      {totalWaiting}
                    </p>
                  </div>
                  <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-slate-200 bg-white shadow-sm">
                    <p className="text-slate-600 text-base font-medium leading-normal">
                      Avg. Processing Time
                    </p>
                    <p className="text-slate-900 tracking-tight text-4xl font-bold leading-tight">
                      {formatTime(avgProcessingTime)}
                    </p>
                  </div>
                  <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-slate-200 bg-white shadow-sm">
                    <p className="text-slate-600 text-base font-medium leading-normal">
                      Served Today
                    </p>
                    <p className="text-slate-900 tracking-tight text-4xl font-bold leading-tight">
                      {servedToday}
                    </p>
                  </div>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  {/* Currently Serving Card */}
                  <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="flex flex-col items-center justify-start rounded-xl p-6 sm:p-8 bg-white border border-slate-200 shadow-sm">
                      <div className="flex w-full flex-col items-center justify-center gap-4 py-4 text-center">
                        <p className="text-slate-600 text-lg font-medium leading-normal">
                          Currently Serving
                        </p>
                        <p className="text-[#2b7cee] text-7xl sm:text-8xl font-bold leading-none tracking-tighter">
                          {currentServing}
                        </p>
                        <p className="text-slate-500 text-base font-normal leading-normal mt-2">
                          {waitingList.length > 0
                            ? "Next customer in queue"
                            : "No one waiting"}
                        </p>
                      </div>

                      {/* Customer Details */}
                      {waitingList.length > 0 && waitingList[0] && (
                        <div className="w-full mt-4 pt-4 border-t border-slate-200">
                          <div className="flex flex-col gap-3 text-left">
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                Queue Number
                              </p>
                              <p className="text-base font-bold text-slate-900">
                                {waitingList[0].queueNumber}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                Full Name
                              </p>
                              <p className="text-base font-medium text-slate-900">
                                {waitingList[0].fullName}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                Position
                              </p>
                              <p className="text-base font-medium text-slate-900">
                                {waitingList[0].position}
                              </p>
                            </div>
                            {waitingList[0].phoneNumber && (
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                                  Phone Number
                                </p>
                                <p className="text-base font-medium text-slate-900">
                                  {waitingList[0].phoneNumber}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="w-full mt-6">
                        <button
                          onClick={handleNextCustomer}
                          disabled={processingNext || waitingList.length === 0}
                          className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-5 flex-1 bg-[#2b7cee] text-slate-50 gap-3 text-lg font-bold leading-normal tracking-[0.015em] w-full shadow-sm hover:bg-[#2b7cee]/90 focus:ring-4 focus:ring-[#2b7cee]/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span className="truncate">
                            {processingNext ? "Processing..." : "Next Customer"}
                          </span>
                          <ArrowRight size={20} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Waiting List Table */}
                  <div className="lg:col-span-2">
                    <div className="flex flex-col rounded-xl bg-white border border-slate-200 shadow-sm">
                      <h2 className="text-slate-900 text-xl font-bold leading-tight tracking-[-0.015em] px-6 py-5 border-b border-slate-200">
                        Waiting List
                      </h2>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                            <tr>
                              <th
                                className="px-6 py-3 font-semibold"
                                scope="col"
                              >
                                #
                              </th>
                              <th
                                className="px-6 py-3 font-semibold"
                                scope="col"
                              >
                                Name
                              </th>
                              <th
                                className="px-6 py-3 font-semibold text-center"
                                scope="col"
                              >
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {waitingList.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={3}
                                  className="px-6 py-8 text-center text-slate-500"
                                >
                                  No one waiting in queue
                                </td>
                              </tr>
                            ) : (
                              waitingList.map((customer, index) => (
                                <tr
                                  key={`${customer.queueNumber}-${index}`}
                                  className={
                                    index !== waitingList.length - 1
                                      ? "border-b border-slate-200"
                                      : ""
                                  }
                                >
                                  <td className="px-6 py-4 font-bold text-slate-800">
                                    {customer.queueNumber}
                                  </td>
                                  <td className="px-6 py-4 font-medium text-slate-900">
                                    {customer.fullName}
                                  </td>
                                  <td className="px-6 py-4 text-center">
                                    <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                                      Waiting
                                    </span>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
