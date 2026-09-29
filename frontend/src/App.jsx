import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login.jsx';
import DashboardHome from './pages/DashboardHome.jsx';
import Expenses from './pages/Expenses.jsx';
import Subscriptions from './pages/Subscriptions.jsx';
import DashboardLayout from './components/DashboardLayout.jsx';
import ProtectedRoute from './routes/ProtectedRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardHome />} />
        <Route path="expenses" element={<Expenses />} />
        <Route path="subscriptions" element={<Subscriptions />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
