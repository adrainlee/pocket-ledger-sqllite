import { NextResponse } from 'next/server';
import DB from '@/lib/db';
import { isValid, parseISO } from 'date-fns';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');
        const categoryId = searchParams.get('categoryId');

        // 如果提供了日期范围，返回指定范围内的支出
        if (startDate && endDate) {
            const start = parseISO(startDate);
            const end = parseISO(endDate);

            if (!isValid(start) || !isValid(end)) {
                return NextResponse.json(
                    { error: '无效的日期格式' },
                    { status: 400 }
                );
            }

            const expenses = DB.getExpensesByDateRange(start, end);
            return NextResponse.json(expenses);
        }

        // 如果提供了分类ID，返回该分类的所有支出
        if (categoryId) {
            const id = parseInt(categoryId);
            if (isNaN(id)) {
                return NextResponse.json(
                    { error: '无效的分类ID' },
                    { status: 400 }
                );
            }

            const expenses = DB.getExpensesByCategory(id);
            return NextResponse.json(expenses);
        }

        // 默认返回所有支出记录
        const expenses = DB.getAllExpenses();
        return NextResponse.json(expenses);
    } catch (error) {
        console.error('获取支出记录失败:', error);
        return NextResponse.json(
            { error: '获取支出记录失败' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { amount, category_id, date, note } = body;

        // 验证必填字段
        if (!amount || !category_id || !date) {
            return NextResponse.json(
                { error: '缺少必要字段' },
                { status: 400 }
            );
        }

        // 验证金额
        if (typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json(
                { error: '无效的金额' },
                { status: 400 }
            );
        }

        // 验证分类ID
        const category = DB.getCategoryById(category_id);
        if (!category) {
            return NextResponse.json(
                { error: '无效的分类ID' },
                { status: 400 }
            );
        }

        // 验证日期
        const expenseDate = parseISO(date);
        if (!isValid(expenseDate)) {
            return NextResponse.json(
                { error: '无效的日期格式' },
                { status: 400 }
            );
        }

        const id = DB.createExpense({
            amount,
            category_id,
            date,
            note: note || ''
        });

        const expense = DB.getExpenseById(id);
        return NextResponse.json(expense);
    } catch (error) {
        console.error('创建支出记录失败:', error);
        return NextResponse.json(
            { error: '创建支出记录失败' },
            { status: 500 }
        );
    }
}