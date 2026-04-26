
export const normalizeUserRole = (role) => {
  const normalized = String(role || '').toLowerCase().trim();
  console.log('Normalizing role:', role, '->', normalized);
  if (normalized === 'admin' || normalized === 'super_admin' || normalized === 'superadmin') return 'superadmin';
  if (normalized === 'hr' || normalized === 'hr_manager') return 'hr';
  return 'employee';
};

export const getAuthUser = () => {
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('userAuth');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        if (userData && userData.role) {
          return {
            ...userData,
            role: normalizeUserRole(userData.role)
          };
        }
      } catch (e) {
        localStorage.removeItem('userAuth');
      }
    }
  }
  return null;
};

export const logoutUser = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userAuth');
  }
};

export const getAuthToken = (user = null) => {
  if (user?.token) return user.token;
  if (typeof window !== 'undefined') {
    const savedUser = localStorage.getItem('userAuth');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        return userData.token || userData.access_token || null;
      } catch (e) {
        return null;
      }
    }
  }
  return null;
};

export const getAuthHeaders = (user = null) => {
  const token = getAuthToken(user);
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};
