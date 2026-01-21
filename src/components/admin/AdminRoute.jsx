// frontend/src/components/admin/AdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminRoute = ({ children }) => {
  const { user, token, isAuth } = useSelector(state => state.user);

  if (!token || !isAuth || !user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;

  return children;
};

export default AdminRoute;
