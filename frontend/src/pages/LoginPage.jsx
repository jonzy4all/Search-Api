import {
  LockKeyhole,
  LogIn,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [form, setForm] =
    useState({
      email: "",
      password: "",
    });

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const { login } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const updateField = (event) => {
    setForm({
      ...form,
      [event.target.name]:
        event.target.value,
    });
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const result = await login(
        form.email,
        form.password
      );

      const user =
        result.data.user;

      if (user.role === "admin") {
        navigate("/admin");
        return;
      }

      navigate(
        location.state?.from ||
          "/"
      );
    } catch (err) {
      setError(
        err.response?.data
          ?.message ||
          "Login failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">
          <LockKeyhole size={25} />
        </div>

        <h1>Welcome back</h1>

        <p>
          Sign in to save records and
          manage your favorites.
        </p>

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="form-stack"
        >
          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={updateField}
              placeholder="you@example.com"
            />
          </div>

          <div className="form-group">
            <label>Password</label>

            <input
              type="password"
              name="password"
              required
              value={form.password}
              onChange={updateField}
              placeholder="Your password"
            />
          </div>

          <button
            className="button primary full"
            disabled={loading}
          >
            <LogIn size={17} />

            {loading
              ? "Signing in..."
              : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account?{" "}
          <Link to="/register">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}