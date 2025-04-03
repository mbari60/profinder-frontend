import React, { createContext, useState, useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// Create context
const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Initialize user on mount
  useEffect(() => {
    const initUser = async () => {
      setLoading(true);

      // Check for user in localStorage
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);

          // Verify token validity
          try {
            await api.get("/api/me/");
          } catch (err) {
            // Token might be invalid, but handled by API interceptor
            console.log("Session verification:", err.message);
          }
        }
      } catch (err) {
        console.error("Error initializing user:", err);
      } finally {
        setLoading(false);
      }
    };

    initUser();
  }, []);

  // Login function
  // const login = async (username, password) => {
  //   try {
  //     setError(null);
  //     setLoading(true);

  //     const response = await api.post("/api/token/", { username, password });

  //     if (response.data.access) {
  //       // Save tokens
  //       localStorage.setItem("access_token", response.data.access);
  //       localStorage.setItem("refresh_token", response.data.refresh);

  //       // Also save tokens as cookies for middleware access
  //       document.cookie = `access_token=${response.data.access}; path=/; max-age=86400; SameSite=Strict`;
  //       document.cookie = `refresh_token=${response.data.refresh}; path=/; max-age=604800; SameSite=Strict`;

  //       // Get user info
  //       const userResponse = await api.get("/api/me/");
  //       const userData = userResponse.data;

  //       // Save user data
  //       localStorage.setItem("user", JSON.stringify(userData));
  //       document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=86400; SameSite=Strict`;
  //       setUser(userData);

  //       setLoading(false);

  //       // Handle redirection
  //       if (userData.password_change_required) {
  //         router.push("/changePassword");
  //       } else {
  //         router.push("/");        
  //       }

  //       return true;
  //     }

  //     setLoading(false);
  //     return false;
  //   } catch (err) {
  //     console.error("Login failed:", err);
  //     setError(err.response?.data?.detail || "Login failed. Please try again.");
  //     setLoading(false);
  //     return false;
  //   }
  // };
  
  const login = async (username, password) => {
    try {
      setError(null);
      setLoading(true);
  
      const response = await api.post("/api/token/", { username, password });
  
      if (response.data.access) {
        // Save tokens
        localStorage.setItem("access_token", response.data.access);
        localStorage.setItem("refresh_token", response.data.refresh);
  
        // Also save tokens as cookies for middleware access
        document.cookie = `access_token=${response.data.access}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `refresh_token=${response.data.refresh}; path=/; max-age=604800; SameSite=Strict`;
  
        // Get user info
        const userResponse = await api.get("/api/me/");
        const userData = userResponse.data;
  
        // Save user data
        localStorage.setItem("user", JSON.stringify(userData));
        document.cookie = `user=${encodeURIComponent(JSON.stringify(userData))}; path=/; max-age=86400; SameSite=Strict`;
        setUser(userData);
  
        setLoading(false);
  
        // Show success toast
        toast.success("Login successful! Redirecting...", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
  
        // Handle redirection with slight delay
        setTimeout(() => {
          if (userData.password_change_required) {
            router.push("admin/changePassword");
          } else {
            router.push("/");        
          }
        }, 2000);
  
        return true;
      }
  
      setLoading(false);
      return false;
    } catch (err) {
      console.error("Login failed:", err);
      
      // Enhanced error handling
      let errorMessage = "Login failed. Please try again.";
      
      if (err.response) {
        if (err.response.status === 401) {
          errorMessage = "Invalid username or password";
        } else if (err.response.status === 400) {
          errorMessage = "Invalid request format";
        } else if (err.response.data?.detail) {
          errorMessage = err.response.data.detail;
        } else if (err.response.data?.non_field_errors) {
          errorMessage = err.response.data.non_field_errors[0];
        }
      } else if (err.request) {
        errorMessage = "No response from server. Please check your connection.";
      }
  
      // Show error toast that stays for 5 seconds
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
  
      setError(errorMessage);
      setLoading(false);
      return false;
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      await api.post("/api/users/", userData);
      setLoading(false);
      router.push("/login");
      return true;
    } catch (err) {
      console.error("Signup failed:", err);
      setError(
        err.response?.data?.detail || "Signup failed. Please try again."
      );
      setLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");

    // Remove cookies
    document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    
    setUser(null);
    router.push("/");
  };

  // Update user data
  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  // Change password
  const changePassword = async (oldPassword, newPassword) => {
    try {
      await api.put("/api/change-password/", {
        old_password: oldPassword,
        new_password: newPassword,
      });

      // Update user if password_change_required was true
      if (user?.password_change_required) {
        updateUser({ password_change_required: false });
      }

      return true;
    } catch (err) {
      console.error("Password change failed:", err);
      throw err;
    }
  };

  // First-time password change
  const firstTimePasswordChange = async (oldPassword, newPassword) => {
    try {
      await api.put("/api/first-time-password-change/", {
        old_password: oldPassword,
        new_password: newPassword,
      });

      updateUser({ password_change_required: false });
      return true;
    } catch (err) {
      console.error("First-time password change failed:", err);
      throw err;
    }
  };

  // Utility functions
  const isAuthenticated = () =>
    !!user && !!localStorage.getItem("access_token");
  const isAdmin = () => user;

  const getSuperusers = () => {
    return process.env.NEXT_PUBLIC_SUPERUSERS 
      ? process.env.NEXT_PUBLIC_SUPERUSERS.split(',').map(u => u.trim())
      : [];
  };

  // Check if user is superuser
  const isSuperAdmin = () => {
    if (!user) return false;
    return getSuperusers().includes(user.username);
  };
  
  const clearError = () => setError(null);

  // Context value
  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    updateUser,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    changePassword,
    firstTimePasswordChange,
    clearError,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Custom hook for using the context
export function useUser() {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}

export default UserContext;
