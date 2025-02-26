'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth.js';
import AuthForm from './AuthForm';

// 定义 Auth 状态类型
interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  authenticate: (token: string) => Promise<boolean>;
  logout: () => void;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const isAuthenticated = useAuth((state: AuthState) => state.isAuthenticated);
  const token = useAuth((state: AuthState) => state.token);
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