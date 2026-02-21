import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('atmToken');
      const userData = localStorage.getItem('atmUser');

      if (!token || !userData) {
        // No token or user data, redirect to login
        router.push('/atm/login');
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Token exists, user is authenticated
      setUser(JSON.parse(userData));
      setIsAuthenticated(true);
      setLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      router.push('/atm/login');
      setIsAuthenticated(false);
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('atmToken');
    localStorage.removeItem('atmUser');
    router.push('/atm/login');
  };

  return { isAuthenticated, loading, user, logout };
}
