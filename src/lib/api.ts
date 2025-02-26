import { useAuth } from './auth';

interface FetchOptions extends RequestInit {
    params?: Record<string, string>;
}

export async function fetchApi(endpoint: string, options: FetchOptions = {}) {
    const { params, headers, ...rest } = options;

    // 从 store 获取令牌
    const token = useAuth.getState().token;

    if (!token) {
        throw new Error('未认证');
    }

    const url = new URL(endpoint, window.location.origin);
    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            url.searchParams.append(key, value);
        });
    }

    const response = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...headers,
        },
        ...rest,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: '请求失败' }));
        throw new Error(error.error || '请求失败');
    }

    return response.json();
}