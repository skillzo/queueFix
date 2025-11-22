import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Users, Clock, ChevronRight } from "lucide-react";
import { mockCompanies } from "../data/mockData";
import Button from "../components/Button";

export default function CompanyList() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const categories = [
    "All",
    ...Array.from(new Set(mockCompanies.map((c) => c.category))),
  ];

  const filteredCompanies = mockCompanies.filter((company) => {
    const matchesSearch =
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "All" || company.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Find a Queue
          </h1>
          <p className="text-gray-600 text-lg">
            Search for a company and join their virtual queue
          </p>
        </div>

        <div className="mb-8 space-y-6">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={20}
            />
            <input
              type="text"
              className="w-full pl-12 pr-4 py-3.5 text-base border border-gray-200 rounded-lg outline-none transition-all duration-150 bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 placeholder:text-gray-400"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  selectedCategory === category
                    ? "text-blue-500 shadow-sm border border-blue-500"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-primary hover:text-primary"
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompanies.length === 0 ? (
            <div className="col-span-full flex items-center justify-center py-16">
              <p className="text-gray-500 text-lg">
                No companies found matching your search.
              </p>
            </div>
          ) : (
            filteredCompanies.map((company) => (
              <div
                key={company.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 cursor-pointer transition-all duration-150 hover:shadow-lg hover:-translate-y-1 hover:border-primary/30 flex flex-col"
                onClick={() => navigate(`/company/${company.id}`)}
              >
                <div className="w-14 h-14 bg-linear-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center mb-4 text-2xl">
                  {company.imageUrl}
                </div>

                <div className="flex-1 mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {company.name}
                  </h3>
                  <p className="text-sm text-primary font-medium mb-2">
                    {company.category}
                  </p>
                  <p className="text-sm text-gray-500">{company.address}</p>
                </div>

                <div className="flex flex-col gap-2 mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Users size={16} />
                    <span>{company.currentQueueSize} in queue</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600 text-sm">
                    <Clock size={16} />
                    <span>~{company.estimatedWaitTime} min wait</span>
                  </div>
                </div>

                <Button
                  fullWidth
                  variant="primary"
                  icon={ChevronRight}
                  iconPosition="right"
                >
                  Join Queue
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
