import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  MoreVertical,
  MapPin,
  ExternalLink,
  Clock,
} from "lucide-react";
import { mockCompanies } from "../data/mockData";

export default function CompanyDetails() {
  const { companyId } = useParams<{ companyId: string }>();
  const navigate = useNavigate();

  const company = mockCompanies.find((c) => c.id === companyId);

  if (!company) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Company not found
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

  // Calculate queue preview segments (visual representation)
  const totalSegments = Math.max(company.currentQueueSize, 33);
  const nextCount = Math.min(3, company.currentQueueSize);
  const segment10Count = Math.min(
    10,
    Math.max(0, company.currentQueueSize - 3)
  );
  const segment20Count = Math.min(
    20,
    Math.max(0, company.currentQueueSize - 13)
  );
  const restCount = Math.max(0, company.currentQueueSize - 33);

  const nextPercent = (nextCount / totalSegments) * 100;
  const segment10Percent = (segment10Count / totalSegments) * 100;
  const segment20Percent = (segment20Count / totalSegments) * 100;
  const restPercent = (restCount / totalSegments) * 100;

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-200 sticky top-0 bg-white z-10">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>

        <h1 className="text-base font-semibold text-gray-900 flex-1 text-center px-4 truncate">
          {company.name}
        </h1>

        <button className="w-10 h-10 flex items-center justify-center text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
          <MoreVertical size={24} />
        </button>
      </header>

      <div className="px-4 pt-6 pb-6 space-y-4">
        {/* Company Icon */}
        <div className="flex justify-center mb-2">
          <div className="w-20 h-20 bg-white border-2 border-blue-100 rounded-full flex items-center justify-center text-4xl shadow-sm">
            {company.imageUrl || "🏢"}
          </div>
        </div>

        {/* Company Description Card */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <p className="text-gray-700 text-sm leading-relaxed">
            {company.description || "No description available."}
          </p>
        </div>

        {/* Company Details Card */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm space-y-4">
          {/* Address */}
          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-gray-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-gray-900 text-sm font-medium truncate">
                {company.address}
              </p>
            </div>
            <button className="text-gray-400 hover:text-gray-600 transition-colors shrink-0">
              <ExternalLink size={18} />
            </button>
          </div>

          {/* Hours */}
          {company.hours && (
            <div className="flex items-start gap-3 pt-4 border-t border-gray-100">
              <Clock size={18} className="text-gray-600 shrink-0 mt-0.5" />
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
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3">
            People in Queue
          </h2>
          <div className="text-4xl font-bold text-gray-900 mb-1">
            {company.currentQueueSize}
          </div>
          <p className="text-gray-500 text-sm">
            Estimated Wait: {company.estimatedWaitTime} mins
          </p>
        </div>

        {/* Queue Preview */}
        <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
          <h2 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-4">
            Queue Preview
          </h2>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden mb-3">
            <div className="h-full flex">
              {nextCount > 0 && (
                <div
                  className="bg-green-500 h-full"
                  style={{ width: `${nextPercent}%` }}
                ></div>
              )}
              {segment10Count > 0 && (
                <div
                  className="bg-blue-500 h-full"
                  style={{ width: `${segment10Percent}%` }}
                ></div>
              )}
              {segment20Count > 0 && (
                <div
                  className="bg-blue-500 h-full"
                  style={{ width: `${segment20Percent}%` }}
                ></div>
              )}
              {restCount > 0 && (
                <div
                  className="bg-gray-300 h-full rounded-r-full"
                  style={{ width: `${restPercent}%` }}
                ></div>
              )}
            </div>
          </div>

          {/* Labels */}
          <div className="flex items-center gap-4 flex-wrap">
            {nextCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-gray-700">Next</span>
              </div>
            )}
            {segment10Count > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs font-medium text-gray-700">10</span>
              </div>
            )}
            {segment20Count > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs font-medium text-gray-700">20</span>
              </div>
            )}
            {restCount > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-xs font-medium text-gray-700">Rest</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Join Queue Button - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <button
          onClick={() => navigate(`/join/${company.id}`)}
          className="w-full py-3.5 bg-blue-500 text-white rounded-xl text-base font-semibold transition-all duration-150 hover:bg-blue-600 active:scale-[0.98] shadow-md"
        >
          Join Queue
        </button>
      </div>
    </div>
  );
}
