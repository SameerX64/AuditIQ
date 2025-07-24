import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
import authService from "../services/authService";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          // Verify token and get user data
          const userData = await authService.getCurrentUser();
          setUser(userData);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("token");
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);

      if (response.success) {
        setUser(response.user);
        localStorage.setItem("token", response.token);
        toast.success("Login successful!");
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Login failed";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await authService.register(userData);

      if (response.success) {
        setUser(response.user);
        localStorage.setItem("token", response.token);
        toast.success("Registration successful!");
        return { success: true };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || "Registration failed";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      localStorage.removeItem("token");
      toast.success("Logged out successfully!");
    } catch (error) {
      console.error("Logout error:", error);
      // Clear local state anyway
      setUser(null);
      localStorage.removeItem("token");
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await authService.updateProfile(profileData);

      if (response.success) {
        setUser(response.user);
        toast.success("Profile updated successfully!");
        return { success: true };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Profile update failed";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await authService.changePassword(
        currentPassword,
        newPassword
      );

      if (response.success) {
        toast.success("Password changed successfully!");
        return { success: true };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.error || "Password change failed";
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    hasPermission: (permission) => {
      if (!user) return false;
      if (user.role === "admin") return true;
      return user.permissions?.[permission] || false;
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
