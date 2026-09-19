import {
  Route,
  Routes,
} from "react-router-dom";

import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import RecordPage from "./pages/RecordPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FavoritesPage from "./pages/FavoritesPage";
import ProfilePage from "./pages/ProfilePage";
import NotFoundPage from "./pages/NotFoundPage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import RecordEditor from "./pages/admin/RecordEditor";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/"
          element={<HomePage />}
        />

        <Route
          path="/records/:identifier"
          element={<RecordPage />}
        />

        <Route
          path="/login"
          element={<LoginPage />}
        />

        <Route
          path="/register"
          element={<RegisterPage />}
        />

        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <FavoritesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute
              roles={["admin"]}
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/records/new"
          element={
            <ProtectedRoute
              roles={["admin"]}
            >
              <RecordEditor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/records/:identifier/edit"
          element={
            <ProtectedRoute
              roles={["admin"]}
            >
              <RecordEditor />
            </ProtectedRoute>
          }
        />

        <Route
          path="*"
          element={<NotFoundPage />}
        />
      </Route>
    </Routes>
  );
}