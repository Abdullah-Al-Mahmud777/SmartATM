// API Configuration
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_URL}/api/auth/login`,
    register: `${API_URL}/api/auth/register`,
    profile: `${API_URL}/api/auth/profile`,
    changePin: `${API_URL}/api/auth/change-pin`,
  },
  transactions: {
    withdraw: `${API_URL}/api/transactions/withdraw`,
    deposit: `${API_URL}/api/transactions/deposit`,
    transfer: `${API_URL}/api/transactions/transfer`,
    history: `${API_URL}/api/transactions/history`,
    balance: `${API_URL}/api/transactions/balance`,
  }
};
