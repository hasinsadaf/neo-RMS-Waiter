import { useEffect, useState, useCallback } from 'react';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState(null);

  const handleStorage = useCallback(() => {
    const token = localStorage.getItem('authToken');
    const storedRole = localStorage.getItem('authRole');

    setIsAuthenticated(Boolean(token));
    setRole(storedRole || null);
  }, []);

  useEffect(() => {
    handleStorage(); // set initial state
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [handleStorage]);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authRole');
    setIsAuthenticated(false);
    setRole(null);
  };

  return { isAuthenticated, role, logout };
}