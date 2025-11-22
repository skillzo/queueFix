import type { Company } from "../types";

// Mock data for development
export const mockCompanies: Company[] = [
  {
    id: "1",
    name: "City Bank Downtown",
    category: "Banking",
    currentQueueSize: 12,
    estimatedWaitTime: 35,
    address: "123 Main St, Downtown",
    imageUrl: "🏦",
    description:
      "Full-service banking with personal and business accounts. Expert financial advisors available.",
    hours: {
      weekdays: "Mon - Fri: 9:00 AM - 5:00 PM",
      weekends: "Sat: 9:00 AM - 1:00 PM",
    },
  },
  {
    id: "2",
    name: "Dr. Smith Medical Clinic",
    category: "Healthcare",
    currentQueueSize: 8,
    estimatedWaitTime: 25,
    address: "456 Health Ave, Medical District",
    imageUrl: "🏥",
    description:
      "Comprehensive medical care with experienced physicians. Walk-ins welcome.",
    hours: {
      weekdays: "Mon - Fri: 8:00 AM - 6:00 PM",
      weekends: "Sat - Sun: 9:00 AM - 3:00 PM",
    },
  },
  {
    id: "3",
    name: "DMV Central Office",
    category: "Government",
    currentQueueSize: 23,
    estimatedWaitTime: 65,
    address: "789 Government Blvd",
    imageUrl: "🏛️",
    description:
      "Driver license services, vehicle registration, and identification cards.",
    hours: {
      weekdays: "Mon - Fri: 8:00 AM - 5:00 PM",
      weekends: "Closed",
    },
  },
  {
    id: "4",
    name: "TechFix Repair Center",
    category: "Technology",
    currentQueueSize: 5,
    estimatedWaitTime: 15,
    address: "321 Tech Park, Suite 100",
    imageUrl: "💻",
    description:
      "Expert device repair for phones, laptops, and tablets. Fast turnaround guaranteed.",
    hours: {
      weekdays: "Mon - Fri: 10:00 AM - 7:00 PM",
      weekends: "Sat - Sun: 11:00 AM - 5:00 PM",
    },
  },
  {
    id: "5",
    name: "Gourmet Restaurant",
    category: "Dining",
    currentQueueSize: 15,
    estimatedWaitTime: 45,
    address: "654 Food Street",
    imageUrl: "🍽️",
    description:
      "Artisanal coffee shop serving specialty brews and freshly baked pastries. A perfect spot to relax and refuel.",
    hours: {
      weekdays: "Mon - Fri: 7:00 AM - 6:00 PM",
      weekends: "Sat - Sun: 8:00 AM - 5:00 PM",
    },
  },
  {
    id: "6",
    name: "Passport Office",
    category: "Government",
    currentQueueSize: 18,
    estimatedWaitTime: 50,
    address: "987 Federal Plaza",
    imageUrl: "📋",
    description:
      "Passport applications, renewals, and expedited services available.",
    hours: {
      weekdays: "Mon - Fri: 8:00 AM - 4:00 PM",
      weekends: "Closed",
    },
  },
];
