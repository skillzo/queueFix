import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone } from "lucide-react";
import Button from "../components/Button";

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (phoneNumber.trim() && phoneNumber.length === 11) {
      localStorage.setItem("phoneNumber", phoneNumber.trim());
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-lg rounded-xl border border-gray-300 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <h1 className="mb-2 text-left text-[32px] font-bold leading-tight tracking-light text-[#3A5B93]">
            QueueFix
          </h1>
          <p className="text-2xl font-bold leading-tight tracking-tight text-gray-900">
            Welcome Back
          </p>
          <p className="mt-2 text-base font-normal leading-normal text-gray-600">
            Enter your phone number to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col">
            <p className="pb-2 text-sm font-medium leading-normal text-gray-600">
              Phone Number
            </p>
            <div className="relative flex items-center">
              <Phone className="absolute left-4 text-gray-500" size={20} />
              <input
                maxLength={11}
                className="h-12 w-full rounded-lg border border-gray-300 bg-white pl-12 pr-4 text-base font-normal leading-normal text-gray-900 placeholder:text-gray-500 focus:outline-0 focus:ring-2 focus:ring-[#3A5B93]/50"
                placeholder="+234 (816) 630-2714"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
            </div>
          </label>

          <Button type="submit" fullWidth>
            Continue
          </Button>
        </form>
      </div>
    </div>
  );
}
