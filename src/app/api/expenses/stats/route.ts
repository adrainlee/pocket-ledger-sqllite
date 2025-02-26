import { NextResponse } from 'next/server';
import DB from '@/lib/db';
import { isValid, parseISO, subDays, startOfDay, endOfDay } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        let startDate = searchParams.get('startDate');
        let endDate = searchParams.get('endDate');

        // 如果没有提供日期范围，默认使用最近30天
        if (!startDate || !endDate) {
            const end = new Date();
            const start = subDays(end, 30);
            startDate = startOfDay(start).toISOString();
            endDate = endOfDay(end).toISOString();
        }

        const start = parseISO(startDate);
        const end = parseISO(endDate);

        if (!isValid(start) || !isValid(end)) {
            return NextResponse.json(
                { error: '无效的日期格式' },
                { status: 400 }
            );
        }

        const stats = DB.getExpenseStats(start, end);
        return NextResponse.json({
            startDate,
            endDate,
            ...stats
        });
    } catch (error) {
        console.error('获取支出统计数据失败:', error);
        return NextResponse.json(
            { error: '获取支出统计数据失败' },
            { status: 500 }
        );
    }
}