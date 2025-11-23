import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual login logic
    console.log("Login attempt:", { email, password });
    // For now, just navigate to admin dashboard
    // navigate("/admin/dashboard");
  };

  const handleForgotPassword = () => {
    // TODO: Implement forgot password logic
    console.log("Forgot password clicked");
  };

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col items-center justify-center bg-gray-50"
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif' }}
    >
      <div className="layout-container flex h-full grow flex-col w-full">
        <div className="flex flex-1 items-center justify-center py-5">
          <div className="layout-content-container flex flex-col w-full max-w-6xl flex-1 px-4 md:px-8">
            <div className="grid w-full grid-cols-1 gap-12 rounded-xl border border-gray-300 bg-white shadow-sm md:grid-cols-2">
              {/* Left Side - Branding */}
              <div className="flex flex-col justify-center p-8 lg:p-12">
                <div className="mb-6">
                  <h1 className="text-[#3A5B93] tracking-light text-[32px] font-bold leading-tight text-left">
                    QueueFix
                  </h1>
                </div>
                <div className="mb-6">
                  <p className="text-gray-900 text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">
                    Manage your queues efficiently.
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-base font-normal leading-normal">
                    The all-in-one solution for seamless customer flow and
                    resource management.
                  </p>
                </div>
              </div>

              {/* Right Side - Login Form */}
              <div className="flex flex-col justify-center bg-gray-50 p-8 lg:p-12 rounded-r-xl">
                <div className="w-full max-w-md mx-auto">
                  <div className="mb-6">
                    <p className="text-gray-900 text-2xl font-bold leading-tight tracking-tight">
                      Admin Login
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Email Field */}
                    <div className="flex flex-col">
                      <label className="flex flex-col w-full">
                        <p className="text-gray-600 text-sm font-medium leading-normal pb-2">
                          Email Address
                        </p>
                        <div className="relative flex w-full flex-1 items-center">
                          <Mail
                            className="absolute left-4 text-gray-500"
                            size={20}
                          />
                          <input
                            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-[#3A5B93]/50 border border-gray-300 bg-white h-12 placeholder:text-gray-500 pl-12 pr-4 text-base font-normal leading-normal"
                            placeholder="you@example.com"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                      </label>
                    </div>

                    {/* Password Field */}
                    <div className="flex flex-col">
                      <label className="flex flex-col w-full">
                        <p className="text-gray-600 text-sm font-medium leading-normal pb-2">
                          Password
                        </p>
                        <div className="relative flex w-full flex-1 items-center">
                          <Lock
                            className="absolute left-4 text-gray-500"
                            size={20}
                          />
                          <input
                            className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 focus:outline-0 focus:ring-2 focus:ring-[#3A5B93]/50 border border-gray-300 bg-white h-12 placeholder:text-gray-500 pl-12 pr-12 text-base font-normal leading-normal"
                            placeholder="Enter your password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                          />
                          <button
                            className="absolute right-0 flex items-center justify-center h-full w-12 text-gray-500 hover:text-gray-700 transition-colors"
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff size={20} />
                            ) : (
                              <Eye size={20} />
                            )}
                          </button>
                        </div>
                      </label>
                    </div>

                    {/* Forgot Password Link */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        className="text-sm font-medium text-[#3A5B93] hover:underline"
                      >
                        Forgot your password?
                      </button>
                    </div>

                    {/* Submit Button */}
                    <button
                      className="flex h-12 items-center justify-center rounded-lg bg-[#3A5B93] text-base font-bold text-white shadow-sm transition-all hover:bg-[#3A5B93]/90 focus:outline-none focus:ring-2 focus:ring-[#3A5B93]/50 focus:ring-offset-2 w-full"
                      type="submit"
                    >
                      Log In
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="w-full py-4 px-4 md:px-8">
          <p className="text-center text-sm text-gray-600">
            © 2024 QueueFix. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
