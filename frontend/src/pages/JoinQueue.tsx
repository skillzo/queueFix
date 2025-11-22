import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle2, Clock } from "lucide-react";
import type { QueueEntry } from "../types";
import { mockCompanies } from "../data/mockData";

export default function JoinQueue() {
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

  const companyName = company.name;
  const [queueEntry, setQueueEntry] = useState<QueueEntry | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Simulate joining the queue
    const newEntry: QueueEntry = {
      id: Math.random().toString(36).substr(2, 9),
      companyId: companyId!,
      companyName,
      position: Math.floor(Math.random() * 30) + 1,
      estimatedWaitTime: Math.floor(Math.random() * 60) + 10,
      fullName: formData.fullName,
      phoneNumber: formData.phoneNumber,
      joinedAt: new Date(),
    };

    setQueueEntry(newEntry);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (queueEntry) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full">
          <div className="flex justify-center mb-6 animate-[scaleIn_0.4s_ease-out]">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 rounded-full scale-110"></div>
              <CheckCircle2
                size={48}
                className="relative text-green-500 fill-green-500"
                strokeWidth={2}
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 text-center mb-12">
            You're in the queue!
          </h1>

          <div className="text-center mb-6">
            <p className="text-sm text-gray-600 mb-2">Your Number</p>
            <p className="text-6xl font-bold text-primary leading-none animate-[fadeInUp_0.5s_ease-out_0.2s_both]">
              {queueEntry.position}
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 text-gray-600 text-sm mb-6">
            <Clock size={16} />
            <span>Estimated Wait: ~{queueEntry.estimatedWaitTime} mins</span>
          </div>

          <p className="text-center text-gray-600 text-sm mb-12 leading-relaxed">
            We'll call your name or text you when it's your turn.
          </p>

          <button
            onClick={() =>
              navigate(`/queue/${queueEntry.position}`, {
                state: { companyName },
              })
            }
            className="w-full py-3.5 bg-gray-200 text-gray-900 rounded-lg text-base font-semibold transition-all duration-150 hover:bg-gray-300"
          >
            Go to Queue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-12 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Join the Queue
        </h1>
        <p className="text-gray-600 mb-12 text-[15px]">
          Enter your details to get your spot in line.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="flex flex-col">
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              className="w-full px-4 py-3 text-base border border-gray-200 rounded-lg outline-none transition-all duration-150 bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-gray-400"
              placeholder="e.g., Alex Doe"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-900 mb-2"
            >
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              className="w-full px-4 py-3 text-base border border-gray-200 rounded-lg outline-none transition-all duration-150 bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-gray-400"
              placeholder="For SMS notifications"
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-primary text-white rounded-lg text-base font-semibold transition-all duration-150 hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-md"
          >
            Join Queue
          </button>
        </form>
      </div>
    </div>
  );
}
