import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Documents from "./pages/Documents";

// Simple auth check
const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

// Protected Route Wrapper
function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <Upload />
            </PrivateRoute>
          }
        />

        {/* Day 4: Document Listing */}
        <Route
          path="/documents"
          element={
            <PrivateRoute>
              <Documents />
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
