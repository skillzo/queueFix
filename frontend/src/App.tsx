import { Routes, Route } from "react-router-dom";
import CompanyList from "./pages/CompanyList";
import CompanyDetails from "./pages/CompanyDetails";
import JoinQueue from "./pages/JoinQueue";
import ActiveQueue from "./pages/ActiveQueue";
import "./App.css";

function App() {
  return (
    <div className="">
      <Routes>
        <Route path="/" element={<CompanyList />} />
        <Route path="/company/:companyId" element={<CompanyDetails />} />
        <Route path="/join/:companyId" element={<JoinQueue />} />
        <Route path="/queue/:queueNumber" element={<ActiveQueue />} />
      </Routes>
    </div>
  );
}

export default App;
