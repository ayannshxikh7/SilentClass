import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('silentclass_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('silentclass_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (payload, rememberMe) => {
    const response = await authApi.login(payload);
    setToken(response.token);
    setUser(response.user);

    if (rememberMe) {
      localStorage.setItem('silentclass_token', response.token);
      localStorage.setItem('silentclass_user', JSON.stringify(response.user));
    }
    return response;
  };

  const register = async (payload) => authApi.register(payload);

  const refreshProfile = useCallback(async () => {
    if (!token) return null;
    const response = await authApi.getProfile(token);
    setUser(response.user);
    localStorage.setItem('silentclass_user', JSON.stringify(response.user));
    return response.user;
  }, [token]);

  const updateProfile = useCallback(
    async (payload) => {
      const response = await authApi.updateProfile(token, payload);
      setUser(response.user);
      localStorage.setItem('silentclass_user', JSON.stringify(response.user));
      return response.user;
    },
    [token]
  );

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('silentclass_token');
    localStorage.removeItem('silentclass_user');
  };

  const value = useMemo(
    () => ({ token, user, login, register, logout, refreshProfile, updateProfile }),
    [token, user, refreshProfile, updateProfile]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
