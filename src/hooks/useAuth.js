import { useEffect, useReducer, useCallback } from 'react';

function readAuthFromStorage() {
  const token = localStorage.getItem('authToken');
  const role = localStorage.getItem('authRole');
  const tenantId = localStorage.getItem('tenantId');

  return {
    token,
    role,
    tenantId,
    isAuthenticated: Boolean(token),
  };
}

export function useAuth() {
  const [, forceRefresh] = useReducer((value) => value + 1, 0);

  const syncAuthState = useCallback(() => {
    forceRefresh();
  }, []);

  useEffect(() => {
    window.addEventListener('storage', syncAuthState);
    window.addEventListener('focus', syncAuthState);

    return () => {
      window.removeEventListener('storage', syncAuthState);
      window.removeEventListener('focus', syncAuthState);
    };
  }, [syncAuthState]);

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authRole');
    localStorage.removeItem('tenantId');
    localStorage.removeItem('restaurantId');
    localStorage.removeItem('waiterId');
    localStorage.removeItem('userName');
    localStorage.removeItem('waiterName');
    syncAuthState();
  };

  const authState = readAuthFromStorage();

  return {
    isAuthenticated: authState.isAuthenticated,
    role: authState.role,
    token: authState.token,
    tenantId: authState.tenantId,
    logout,
    refreshAuth: syncAuthState,
  };
}