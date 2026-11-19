import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/Login";
import Sign from "./Components/Sign";
import Dashboard from "./Components/Dashboard";
import AddStudent from "./Components/AddStudent";
import Managestudents from "./Components/ManageStudents";

// Sirf logged-in user ko andar jaane do
const Protected = ({ children }) =>
  localStorage.getItem("token") ? children : <Navigate to="/" replace />;

function App() {
  return (
    <Routes>
      {/* pehle login aur signup */}
      <Route path="/" element={<Login />} />
      <Route path="/signup" element={<Sign />} />

      {/* login ke baad dashboard */}
      <Route
        path="/dashboard"
        element={
          <Protected>
            <Dashboard />
          </Protected>
        }
      />

      <Route
        path="/addstudent"
        element={
          <Protected>
            <AddStudent />
          </Protected>
        }
      />

      <Route
        path="/managestudents"
        element={
          <Protected>
            <Managestudents />
          </Protected>
        }
      />

      {/* galat URL par login page pe bhejo */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;