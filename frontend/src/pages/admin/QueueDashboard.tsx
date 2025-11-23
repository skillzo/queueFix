import { useState } from "react";
import { Bell, ArrowRight } from "lucide-react";

interface QueueCustomer {
  id: number;
  name: string;
  status: "waiting" | "serving" | "completed";
}

export default function QueueDashboard() {
  const [currentServing, setCurrentServing] = useState(105);
  const [waitingList] = useState<QueueCustomer[]>([
    { id: 106, name: "Olivia Martinez", status: "waiting" },
    { id: 107, name: "Benjamin Carter", status: "waiting" },
    { id: 108, name: "Sophia Garcia", status: "waiting" },
    { id: 109, name: "Liam Rodriguez", status: "waiting" },
    { id: 110, name: "Ava Hernandez", status: "waiting" },
  ]);

  const handleNextCustomer = () => {
    setCurrentServing((prev) => prev + 1);
    // TODO: Implement actual queue progression logic
    console.log("Next customer called");
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        {/* Header */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-slate-200 px-6 sm:px-8 md:px-10 py-4 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4 text-slate-900">
            <div className="size-6 text-[#2b7cee]">
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
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
          <div className="hidden md:flex flex-1 justify-center gap-8">
            <div className="flex items-center gap-8">
              <a
                className="text-[#2b7cee] text-sm font-semibold leading-normal"
                href="#"
              >
                Dashboard
              </a>
              <a
                className="text-slate-600 hover:text-slate-900 text-sm font-medium leading-normal"
                href="#"
              >
                History
              </a>
              <a
                className="text-slate-600 hover:text-slate-900 text-sm font-medium leading-normal"
                href="#"
              >
                Settings
              </a>
            </div>
          </div>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-slate-100 text-slate-600 hover:bg-slate-200">
              <Bell size={20} />
            </button>
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCNhxWnrf3iaBgPN4R4MRFHsmPvnsqBX9PblVZcQa0Dg7A_ZKwlbyhILvWAHxj8Z5Uw1HUDUE579KKLzGAaHO6B_vtDz-3wXbCpAcrdkAWGOfhcy1ZheoZGyjZDJcuqhaeNMe5eoxd8v-TW1dbO3bgQF4qYPHuXWzRpxLZ3CFKwyClMoEYGH_P_WJzcUVIxtjpBKBh4J2p7BmUSIKHirecpTMG7jrdSKOMoDmlLi3IgsL4vlt7eGQ84xrBQ4ZZMOlbJpxyJgFSgQj1b")',
              }}
            ></div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 md:px-10 py-8 bg-[#f6f7f8]">
          <div className="mx-auto max-w-7xl">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-slate-200 bg-white shadow-sm">
                <p className="text-slate-600 text-base font-medium leading-normal">
                  Total Waiting
                </p>
                <p className="text-slate-900 tracking-tight text-4xl font-bold leading-tight">
                  12
                </p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-slate-200 bg-white shadow-sm">
                <p className="text-slate-600 text-base font-medium leading-normal">
                  Avg. Processing Time
                </p>
                <p className="text-slate-900 tracking-tight text-4xl font-bold leading-tight">
                  5m 30s
                </p>
              </div>
              <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 border border-slate-200 bg-white shadow-sm">
                <p className="text-slate-600 text-base font-medium leading-normal">
                  Served Today
                </p>
                <p className="text-slate-900 tracking-tight text-4xl font-bold leading-tight">
                  87
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
                      Please proceed to counter 3
                    </p>
                  </div>
                  <div className="w-full mt-6">
                    <button
                      onClick={handleNextCustomer}
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-14 px-5 flex-1 bg-[#2b7cee] text-slate-50 gap-3 text-lg font-bold leading-normal tracking-[0.015em] w-full shadow-sm hover:bg-[#2b7cee]/90 focus:ring-4 focus:ring-[#2b7cee]/30 transition-all"
                    >
                      <span className="truncate">Next Customer</span>
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
                          <th className="px-6 py-3 font-semibold" scope="col">
                            #
                          </th>
                          <th className="px-6 py-3 font-semibold" scope="col">
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
                        {waitingList.map((customer, index) => (
                          <tr
                            key={customer.id}
                            className={
                              index !== waitingList.length - 1
                                ? "border-b border-slate-200"
                                : ""
                            }
                          >
                            <td className="px-6 py-4 font-bold text-slate-800">
                              {customer.id}
                            </td>
                            <td className="px-6 py-4 font-medium text-slate-900">
                              {customer.name}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                                Waiting
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
