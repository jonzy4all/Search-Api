import {
  UserPlus,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const [form, setForm] =
    useState({
      name: "",
      email: "",
      password: "",
      passwordConfirm: "",
    });

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const { register } = useAuth();

  const navigate = useNavigate();

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

    setError("");
    setLoading(true);

    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data
          ?.message ||
          err.response?.data
            ?.errors?.[0]?.message ||
          "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">
          <UserPlus size={25} />
        </div>

        <h1>Create account</h1>

        <p>
          Register to start saving your
          favorite records.
        </p>

        {error && (
          <div className="alert error">
            {error}
          </div>
        )}

        <form
          className="form-stack"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label>Name</label>

            <input
              name="name"
              required
              value={form.name}
              onChange={updateField}
            />
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={updateField}
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
            />

            <small>
              Minimum 8 characters with
              uppercase, lowercase and a
              number.
            </small>
          </div>

          <div className="form-group">
            <label>
              Confirm password
            </label>

            <input
              type="password"
              name="passwordConfirm"
              required
              value={
                form.passwordConfirm
              }
              onChange={updateField}
            />
          </div>

          <button
            className="button primary full"
            disabled={loading}
          >
            <UserPlus size={17} />

            {loading
              ? "Creating..."
              : "Create account"}
          </button>
        </form>

        <p className="auth-switch">
          Already registered?{" "}
          <Link to="/login">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}