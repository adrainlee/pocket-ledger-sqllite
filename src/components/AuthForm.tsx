import { useState } from 'react';
import { useAuth } from '@/lib/auth';

const AuthForm = () => {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const authenticate = useAuth((state: any) => state.authenticate);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('请输入认证字符串');
      return;
    }

    setIsLoading(true);
    try {
      const success = await authenticate(token.trim());
      if (!success) {
        setError('认证失败，请检查认证字符串是否正确');
      }
    } catch (error) {
      console.error('认证失败:', error);
      setError('认证失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            欢迎使用记账本
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            请输入认证字符串以继续
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="token" className="sr-only">
              认证字符串
            </label>
            <input
              id="token"
              type="text"
              required
              className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="请输入认证字符串"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400"
            >
              {isLoading ? '认证中...' : '确认'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthForm;