import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../api/api";

const AuthContext = createContext(null);

const TOKEN_KEY = "search_api_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const token =
    localStorage.getItem(TOKEN_KEY);

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response =
          await api.get("/auth/me");

        setUser(response.data.data.user);
      } catch (error) {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const saveSession = (data) => {
    localStorage.setItem(
      TOKEN_KEY,
      data.token
    );

    setUser(data.user);
  };

  const login = async (
    email,
    password
  ) => {
    const response = await api.post(
      "/auth/login",
      {
        email,
        password,
      }
    );

    saveSession(response.data.data);

    return response.data;
  };

  const register = async (formData) => {
    const response = await api.post(
      "/auth/register",
      formData
    );

    saveSession(response.data.data);

    return response.data;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const changePassword = async (
    passwordData
  ) => {
    const response = await api.patch(
      "/auth/change-password",
      passwordData
    );

    saveSession(response.data.data);

    return response.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        changePassword,
        isAuthenticated: Boolean(user),
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}