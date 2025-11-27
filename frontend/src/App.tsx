import { Routes, Route } from "react-router-dom";
import CompanyList from "./pages/CompanyList";
import CompanyDetails from "./pages/CompanyDetails";
import ActiveQueue from "./pages/ActiveQueue";
import YoureNext from "./pages/YoureNext";
import QueueCompleted from "./pages/QueueCompleted";
import NavigationPage from "./pages/NavigationPage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import QueueDashboard from "./pages/admin/QueueDashboard";
import Login from "./pages/Login";
import MyQueues from "./pages/MyQueues";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

function App() {
  return (
    <div className="">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<CompanyList />} />
        <Route
          path="/my-queues"
          element={
            <ProtectedRoute>
              <MyQueues />
            </ProtectedRoute>
          }
        />
        <Route
          path="/company/:companyId"
          element={
            <ProtectedRoute>
              <CompanyDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/queue/:queueNumber"
          element={
            <ProtectedRoute>
              <ActiveQueue />
            </ProtectedRoute>
          }
        />

        <Route
          path="/queue/:queueNumber/next"
          element={
            <ProtectedRoute>
              <YoureNext />
            </ProtectedRoute>
          }
        />
        <Route
          path="/queue/:queueNumber/complete"
          element={
            <ProtectedRoute>
              <QueueCompleted />
            </ProtectedRoute>
          }
        />

        <Route
          path="/queue/:queueNumber/navigate"
          element={<NavigationPage />}
        />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="/admin/dashboard/:companyId"
          element={<QueueDashboard />}
        />
      </Routes>
    </div>
  );
}

export default App;
