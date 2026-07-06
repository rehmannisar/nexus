import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, UserRole, AuthContextType } from '../types';
import toast from 'react-hot-toast';
import api from '../api';

// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const USER_STORAGE_KEY = 'business_nexus_user';
const TOKEN_STORAGE_KEY = 'token';

// Helper: convert backend user shape into the frontend's User type
const mapBackendUser = (data: any): User => ({
  id: data._id,
  name: data.name,
  email: data.email,
  role: data.role,
  avatarUrl: data.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name)}&background=random`,
  bio: data.bio || '',
  isOnline: true,
  createdAt: data.createdAt || new Date().toISOString(),
});

// Auth Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  // Real login function - calls the backend API
  const login = async (email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });

      if (res.data.role !== role) {
        throw new Error(`This account is registered as ${res.data.role}, not ${role}`);
      }

      localStorage.setItem(TOKEN_STORAGE_KEY, res.data.token);

      const loggedInUser = mapBackendUser(res.data);
      setUser(loggedInUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(loggedInUser));
      toast.success('Successfully logged in!');
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Login failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Real register function - calls the backend API
  const register = async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    setIsLoading(true);

    try {
      const res = await api.post('/auth/register', { name, email, password, role });

      localStorage.setItem(TOKEN_STORAGE_KEY, res.data.token);

      const newUser = mapBackendUser(res.data);
      setUser(newUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));
      toast.success('Account created successfully!');
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Registration failed';
      toast.error(message);
      throw new Error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot/reset password - not built in the backend for this submission (Week 1-2 scope),
  // kept as a light mock so the UI doesn't break if these pages are visited.
  const forgotPassword = async (email: string): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Password reset instructions sent to your email');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Password reset successfully');
    } catch (error) {
      toast.error((error as Error).message);
      throw error;
    }
  };

  // Logout function
  const logout = (): void => {
    setUser(null);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    toast.success('Logged out successfully');
  };

  // Update user profile - calls the backend API
  const updateProfile = async (userId: string, updates: Partial<User>): Promise<void> => {
    try {
      const res = await api.put('/users/profile', {
        name: updates.name,
        bio: updates.bio,
        profilePicture: updates.avatarUrl,
      });

      const updatedUser = mapBackendUser(res.data);
      setUser(updatedUser);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
      toast.success('Profile updated successfully');
    } catch (error: any) {
      const message = error?.response?.data?.message || error.message || 'Update failed';
      toast.error(message);
      throw new Error(message);
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
