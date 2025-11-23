import { useNavigate, useParams } from "react-router-dom";
import { X, Navigation } from "lucide-react";

export default function NavigationPage() {
  const navigate = useNavigate();
  const { queueNumber } = useParams();

  const handleClose = () => {
    navigate(`/queue/${queueNumber}`);
  };

  const handleOpenNavigation = () => {
    // TODO: Implement actual navigation opening (Google Maps, Apple Maps, etc.)
    console.log("Opening navigation...");
    // Example: window.open('https://maps.google.com/?q=...')
  };

  return (
    <div
      className="relative flex h-auto min-h-screen w-full flex-col bg-gray-50 overflow-hidden"
      style={{ fontFamily: '"Inter", "Noto Sans", sans-serif' }}
    >
      <div className="relative flex h-full grow flex-col">
        {/* Map Component (Background) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAeBBgwTtv01sSHD9fCanMsoda7prBSryO5iPqg7PocRUyhGm-zGjUf7SfIh6OU5bZVUljGbQkgxU-AFsaGyUh-SYtfIPJgaN1NAN0VJCrxczxkouuYgLI0ih0qsuej4UHJ49AC3_PXBYk3D2HYbTqMDd8QwJUqJzudf-jYQWCPJrrE5pGVGcuKhpQ37DSY35U01jwi6DCuTeRIW5e2JFVs-rbAeIp6epNfuM5BIOoWE5P55-CcJBvr48_xbM-6Wj7mBfFpVsBPXFFf")',
          }}
        >
          <div className="absolute inset-0 bg-gray-50/30"></div>
        </div>

        {/* UI Overlay */}
        <div className="relative flex h-full min-h-screen flex-col">
          {/* Toolbar Component */}
          <div className="flex justify-between gap-2 px-4 py-3">
            <div className="flex gap-2">
              <button
                onClick={handleClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-gray-800 backdrop-blur-sm hover:bg-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-grow"></div>

          {/* Floating Information Panel */}
          <div className="flex flex-col gap-4 rounded-t-xl bg-white p-4 shadow-2xl">
            {/* Card Component */}
            <div className="@container">
              <div className="flex flex-col items-stretch justify-start rounded-xl">
                <div className="flex w-full grow flex-col items-stretch justify-center gap-1 py-2">
                  <p className="font-display text-sm font-normal leading-normal text-slate-500">
                    Your Turn is Approaching
                  </p>
                  <p className="font-display text-lg font-bold leading-tight tracking-[-0.015em] text-gray-900">
                    It's time to start heading there.
                  </p>
                  <div className="flex items-end justify-between gap-3">
                    <p className="font-display text-base font-normal leading-normal text-slate-500">
                      QueueFix Restaurant, 123 Main Street
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Component */}
            <div className="flex flex-wrap gap-2">
              <div className="flex min-w-[100px] flex-1 flex-col gap-1 rounded-lg border border-slate-200 p-4">
                <p className="font-display text-sm font-medium leading-normal text-slate-600">
                  Distance
                </p>
                <p className="font-display text-2xl font-bold leading-tight tracking-tight text-gray-900">
                  5.2 mi
                </p>
              </div>
              <div className="flex min-w-[100px] flex-1 flex-col gap-1 rounded-lg border border-slate-200 p-4">
                <p className="font-display text-sm font-medium leading-normal text-slate-600">
                  Travel Time
                </p>
                <p className="font-display text-2xl font-bold leading-tight tracking-tight text-gray-900">
                  15 min
                </p>
              </div>
              <div className="flex min-w-[100px] flex-1 flex-col gap-1 rounded-lg border border-slate-200 p-4">
                <p className="font-display text-sm font-medium leading-normal text-slate-600">
                  Queue ETA
                </p>
                <p className="font-display text-2xl font-bold leading-tight tracking-tight text-gray-900">
                  ~20 min
                </p>
              </div>
            </div>

            {/* Single Button Component */}
            <div className="flex py-2 justify-center">
              <button
                onClick={handleOpenNavigation}
                className="flex min-w-[84px] max-w-[480px] flex-1 cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg bg-[#2b7cee] h-12 px-5 text-white hover:bg-[#2b7cee]/90 transition-all"
              >
                <Navigation size={20} className="text-white" />
                <span className="font-display truncate text-base font-bold leading-normal tracking-[0.015em]">
                  Open Navigation
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
