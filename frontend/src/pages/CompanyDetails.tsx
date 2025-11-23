import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  MoreVertical,
  MapPin,
  ExternalLink,
  Clock,
  ChevronRight,
} from "lucide-react";
import { mockCompanies } from "../data/mockData";
import Button from "../components/Button";

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

  return (
    <div className="min-h-screen max-w-3xl w-full mx-auto px-8 py-12 fbc flex-col gap-4">
      <div>
        {/* Header */}
        <header className=" flex items-center justify-between px-4 py-3 border-b border-gray-200 sticky top-0 z-10 w-full">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Company Icon */}
          <div className="flex justify-center mb-2">
            <div className="w-10 h-10 bg-white border-2 border-blue-100 rounded-full flex items-center justify-center text-4xl shadow-sm">
              {company.imageUrl || "🏢"}
            </div>
          </div>

          <button className="w-10 h-10 flex items-center justify-center text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
            <MoreVertical size={24} />
          </button>
        </header>

        <div className="px-4 pt-6 pb-6 space-y-6 mt-8">
          <h1 className="text-5xl font-black text-gray-900 flex-1 truncate">
            {company.name}
          </h1>

          <p className="text-gray-700 text-sm leading-relaxed">
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
                <p className="text-gray-900 text-sm font-medium truncate">
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
              {company.currentQueueSize}
            </div>

            <p className="text-gray-500 text-sm">
              Estimated Wait: {company.estimatedWaitTime} mins
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
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2 w-[10%]">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-600">Next</span>
              </div>
              <div className="flex items-center gap-2 w-[15%] ml-3">
                <div className="w-3 h-3 bg-[#17a2b8] rounded-full"></div>
                <span className="text-sm font-medium text-gray-600">10</span>
              </div>
              <div className="flex items-center gap-2 w-[35%] ml-3">
                <div className="w-3 h-3 bg-[#6cb2eb] rounded-full"></div>
                <span className="text-sm font-medium text-gray-600">20</span>
              </div>
              <div className="flex items-center gap-2 w-[40%] ml-3">
                <div className="w-3 h-3 bg-[#ced4da] rounded-full"></div>
                <span className="text-sm font-medium text-gray-600">Rest</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
  );
}
