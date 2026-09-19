import {
  Heart,
  LogIn,
  LogOut,
  Moon,
  Search,
  ShieldCheck,
  Sun,
  User,
} from "lucide-react";

import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const {
    user,
    logout,
    isAdmin,
  } = useAuth();

  const {
    theme,
    toggleTheme,
  } = useTheme();

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        <Link
          to="/"
          className="logo"
        >
          <div className="logo-icon">
            <Search size={19} />
          </div>

          <div>
            <strong>Searchly</strong>
            <span>Record Explorer</span>
          </div>
        </Link>

        <nav className="nav-links">
          <NavLink to="/">
            Explore
          </NavLink>

          {user && (
            <NavLink to="/favorites">
              <Heart size={17} />
              Favorites
            </NavLink>
          )}

          {isAdmin && (
            <NavLink to="/admin">
              <ShieldCheck size={17} />
              Admin
            </NavLink>
          )}
        </nav>

        <div className="nav-actions">
          <button
            className="icon-button"
            onClick={toggleTheme}
            title="Toggle theme"
          >
            {theme === "light" ? (
              <Moon size={19} />
            ) : (
              <Sun size={19} />
            )}
          </button>

          {user ? (
            <>
              <Link
                to="/profile"
                className="user-chip"
              >
                <User size={17} />

                <span>
                  {user.name}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="button secondary small"
              >
                <LogOut size={16} />
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="button primary small"
            >
              <LogIn size={16} />
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}