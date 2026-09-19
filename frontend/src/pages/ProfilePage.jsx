import {
  KeyRound,
  Shield,
  User,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useAuth,
} from "../context/AuthContext";

export default function ProfilePage() {
  const {
    user,
    changePassword,
  } = useAuth();

  const [form, setForm] =
    useState({
      currentPassword: "",
      newPassword: "",
      newPasswordConfirm: "",
    });

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

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
    setMessage("");

    try {
      const result =
        await changePassword(form);

      setMessage(result.message);

      setForm({
        currentPassword: "",
        newPassword: "",
        newPasswordConfirm: "",
      });
    } catch (err) {
      setError(
        err.response?.data
          ?.message ||
          "Unable to change password."
      );
    }
  };

  return (
    <div className="container page-section">
      <div className="profile-grid">
        <section className="panel">
          <div className="panel-icon">
            <User size={24} />
          </div>

          <h2>Account details</h2>

          <div className="profile-row">
            <span>Name</span>
            <strong>
              {user.name}
            </strong>
          </div>

          <div className="profile-row">
            <span>Email</span>
            <strong>
              {user.email}
            </strong>
          </div>

          <div className="profile-row">
            <span>Role</span>

            <strong className="role-badge">
              <Shield size={14} />
              {user.role}
            </strong>
          </div>
        </section>

        <section className="panel">
          <div className="panel-icon">
            <KeyRound size={24} />
          </div>

          <h2>Change password</h2>

          {message && (
            <div className="alert success">
              {message}
            </div>
          )}

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
              <label>
                Current password
              </label>

              <input
                type="password"
                name="currentPassword"
                required
                value={
                  form.currentPassword
                }
                onChange={updateField}
              />
            </div>

            <div className="form-group">
              <label>
                New password
              </label>

              <input
                type="password"
                name="newPassword"
                required
                value={
                  form.newPassword
                }
                onChange={updateField}
              />
            </div>

            <div className="form-group">
              <label>
                Confirm new password
              </label>

              <input
                type="password"
                name="newPasswordConfirm"
                required
                value={
                  form.newPasswordConfirm
                }
                onChange={updateField}
              />
            </div>

            <button className="button primary">
              Update password
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}