// 导入 zustand 的 create 函数
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// 创建认证状态存储
export const useAuth = create()(
    persist(
        (set) => ({
            token: null,
            isAuthenticated: false,
            authenticate: async (token) => {
                try {
                    // 尝试使用令牌进行一次API调用来验证
                    const response = await fetch('/api/categories', {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (response.ok) {
                        set({ token, isAuthenticated: true });
                        return true;
                    }
                    return false;
                } catch (error) {
                    console.error('认证失败:', error);
                    return false;
                }
            },
            logout: () => {
                set({ token: null, isAuthenticated: false });
            }
        }),
        {
            name: 'auth-storage',
        }
    )
);