// Admin Authentication Helper Functions

export const checkAdminAuth = () => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = '/admin/login';
    return null;
  }
  return token;
};

export const handleTokenExpiry = (data) => {
  if (!data.success && data.message) {
    const message = data.message.toLowerCase();
    if (message.includes('expired') || message.includes('invalid') || message.includes('token')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      alert('Your session has expired. Please login again.');
      window.location.href = '/admin/login';
      return true;
    }
  }
  return false;
};

export const adminLogout = () => {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = '/admin/login';
};

export const fetchWithAuth = async (url, options = {}) => {
  const token = checkAdminAuth();
  if (!token) return null;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  // Check for token expiry
  if (handleTokenExpiry(data)) {
    return null;
  }

  return data;
};
