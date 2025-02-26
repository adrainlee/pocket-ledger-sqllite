'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth.js';
import AuthForm from './AuthForm';

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const isAuthenticated = useAuth((state: any) => state.isAuthenticated);
  const token = useAuth((state: any) => state.token);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 给状态管理一点时间来从localStorage恢复
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !token) {
    return <AuthForm />;
  }

  return <>{children}</>;
};

export default AuthProvider;