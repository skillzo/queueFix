import { Routes, Route } from "react-router-dom";
import CompanyList from "./pages/CompanyList";
import CompanyDetails from "./pages/CompanyDetails";
import JoinQueue from "./pages/JoinQueue";
import ActiveQueue from "./pages/ActiveQueue";
import YoureNext from "./pages/YoureNext";
import QueueCompleted from "./pages/QueueCompleted";
import AdminLogin from "./pages/admin/AdminLogin";
import QueueDashboard from "./pages/admin/QueueDashboard";
import "./App.css";

function App() {
  return (
    <div className="">
      <Routes>
        <Route path="/" element={<CompanyList />} />
        <Route path="/company/:companyId" element={<CompanyDetails />} />
        <Route path="/join/:companyId" element={<JoinQueue />} />
        <Route path="/queue/:queueNumber" element={<ActiveQueue />} />
        <Route path="/queue/:queueNumber/next" element={<YoureNext />} />
        <Route path="/queue/:queueNumber/complete" element={<QueueCompleted />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<QueueDashboard />} />
      </Routes>
    </div>
  );
}

export default App;
