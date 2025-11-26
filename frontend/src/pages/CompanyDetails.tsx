import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  MoreVertical,
  MapPin,
  ExternalLink,
  Clock,
  ChevronRight,
} from "lucide-react";
import Button from "../components/Button";
import { getCompanyById, getQueueStatus } from "../api/companies.api";
import type { Company } from "../types";

export default function CompanyDetails() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [queueSize, setQueueSize] = useState(0);
  const [estimatedWait, setEstimatedWait] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!companyId) return;

      setLoading(true);
      setError(null);

      try {
        const [companyResult, statusResult] = await Promise.all([
          getCompanyById(companyId),
          getQueueStatus(companyId),
        ]);

        if (companyResult.success && companyResult.data) {
          const companyData = companyResult.data;
          if (
            companyData &&
            typeof companyData === "object" &&
            "id" in companyData
          ) {
            setCompany({
              ...(companyData as Company),
              currentQueueSize: 0,
            });
          } else {
            setError("Invalid company data received");
          }
        } else {
          setError(companyResult.message || "Failed to fetch company");
        }

        if (statusResult.success && statusResult.data) {
          const statusData = statusResult.data;

          if (statusData && typeof statusData === "object") {
            setQueueSize((statusData as any).queueSize || 0);
            setEstimatedWait((statusData as any).estimatedWaitMinutes || 0);
          }
        }
      } catch (err) {
        setError("Failed to load company details. Please try again.");
        console.error("Error fetching company:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [companyId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {error || "Company not found"}
          </h1>
          <button
            onClick={() => navigate("/")}
            className="w-full py-3.5 bg-primary text-white rounded-lg text-base font-semibold transition-all duration-150 hover:bg-primary-hover"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl w-full mx-auto px-4 sm:px-8 py-12 flex flex-col gap-4">
      <div className="w-full">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 w-full">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center text-gray-900 hover:bg-gray-100 rounded-full transition-colors shrink-0"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Company Icon */}
          <div className="flex justify-center flex-1">
            <div className="w-16 h-16 bg-white border-2 border-blue-100 rounded-full flex items-center justify-center text-4xl shadow-sm shrink-0">
              {company.imageUrl ? (
                <img
                  src={company.imageUrl}
                  alt={company.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                "🏢"
              )}
            </div>
          </div>

          <button className="w-10 h-10 flex items-center justify-center text-gray-900 hover:bg-gray-100 rounded-full transition-colors shrink-0">
            <MoreVertical size={24} />
          </button>
        </header>

        <div className="px-4 pt-6 pb-6 space-y-6">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 wrap-break-word">
            {company.name}
          </h1>

          <p className="text-gray-700 text-sm leading-relaxed wrap-break-word">
            {company.description || "No description available."}
          </p>

          {/* Company Details Card */}
          <div className="space-y-4">
            {/* Address */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 fcc rounded-lg bg-gray-200">
                <MapPin size={20} className="text-gray-600 shrink-0" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-gray-900 text-sm font-medium wrap-break-word">
                  {company.address}
                </p>
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                <ExternalLink size={20} color="#000" />
              </button>
            </div>

            {/* Hours */}
            {company.hours && (
              <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
                <div className="h-10 w-10 fcc rounded-lg bg-gray-200">
                  <Clock size={20} className="text-gray-600 shrink-0 mt-0.5" />
                </div>
                <div className="flex-1 space-y-0.5">
                  <p className="text-gray-900 text-sm font-medium">
                    {company.hours.weekdays}
                  </p>
                  <p className="text-gray-900 text-sm font-medium">
                    {company.hours.weekends}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Queue Information Card */}
          <div className="bg-white fcc flex-col rounded-xl p-16 border border-gray-100 shadow-sm">
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
              People in Queue
            </h2>

            <div className="text-6xl font-black text-gray-900  my-5">
              {queueSize}
            </div>

            <p className="text-gray-500 text-sm">
              Estimated Wait: {estimatedWait} mins
            </p>
          </div>

          {/* Queue Preview */}
          <div className="">
            <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
              Queue Preview
            </h2>

            {/* Progress Bar */}
            <div className="w-full h-4 bg-gray-300 rounded-full overflow-hidden mb-4">
              <div className="h-full flex">
                <div
                  className="bg-green-500 h-full transition-all duration-300"
                  style={{ width: `10%` }}
                ></div>

                <div
                  className="bg-[#17a2b8] h-full transition-all duration-300"
                  style={{ width: `15%` }}
                ></div>

                <div
                  className="bg-[#6cb2eb] h-full transition-all duration-300"
                  style={{ width: `35%` }}
                ></div>

                <div
                  className="bg-[#ced4da] h-full transition-all duration-300"
                  style={{ width: `40%` }}
                ></div>
              </div>
            </div>

            {/* Labels */}
            <div className="w-full flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-3 h-3 bg-green-500 rounded-full shrink-0"></div>
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                  Next
                </span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-3 h-3 bg-[#17a2b8] rounded-full shrink-0"></div>
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                  10
                </span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-3 h-3 bg-[#6cb2eb] rounded-full shrink-0"></div>
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                  20
                </span>
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-3 h-3 bg-[#ced4da] rounded-full shrink-0"></div>
                <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                  Rest
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full">
        <Button
          onClick={() => navigate(`/join/${company.id}`)}
          fullWidth
          variant="primary"
          icon={ChevronRight}
          iconPosition="right"
        >
          Join Queue
        </Button>
      </div>
    </div>
  );
}
