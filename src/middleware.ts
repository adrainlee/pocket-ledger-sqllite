import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // 跳过非 API 请求
    if (!request.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.next();
    }

    const authToken = request.headers.get('Authorization')?.replace('Bearer ', '');
    const validToken = process.env.AUTH_TOKEN;

    if (!authToken || authToken !== validToken) {
        return NextResponse.json(
            { error: '未授权访问' },
            { status: 401 }
        );
    }

    return NextResponse.next();
}

// 配置需要进行认证的路径
export const config = {
    matcher: '/api/:path*'
};