import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./api/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import AnalystDashboard from "./pages/AnalystDashboard.jsx";
import AdminConsole from "./pages/AdminConsole.jsx";

function Protected({ roles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function HomeRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "SUPER_ADMIN") return <Navigate to="/admin" replace />;
  return <Navigate to="/analyst" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<HomeRedirect />} />
      <Route
        path="/analyst"
        element={
          <Protected roles={["ANALYST", "SUPER_ADMIN"]}>
            <AnalystDashboard />
          </Protected>
        }
      />
      <Route
        path="/admin"
        element={
          <Protected roles={["SUPER_ADMIN"]}>
            <AdminConsole />
          </Protected>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
