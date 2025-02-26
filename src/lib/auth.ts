import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthState {
    token: string | null;
    isAuthenticated: boolean;
    authenticate: (token: string) => Promise<boolean>;
    logout: () => void;
}

export const useAuth = create<AuthState>()(
    persist(
        (set: any) => ({
            token: null,
            isAuthenticated: false,
            authenticate: async (token: string) => {
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