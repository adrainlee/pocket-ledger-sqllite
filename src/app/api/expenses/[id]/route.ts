import { NextResponse } from 'next/server';
import DB from '@/lib/db';
import { isValid, parseISO } from 'date-fns';

interface RouteParams {
    params: {
        id: string;
    };
}

export async function GET(request: Request, context: RouteParams) {
    try {
        const params = await context.params;
        const expenseId = parseInt(params.id);
        if (isNaN(expenseId)) {
            return NextResponse.json(
                { error: '无效的ID' },
                { status: 400 }
            );
        }

        const expense = DB.getExpenseById(expenseId);
        if (!expense) {
            return NextResponse.json(
                { error: '支出记录不存在' },
                { status: 404 }
            );
        }

        return NextResponse.json(expense);
    } catch (error) {
        console.error('获取支出记录详情失败:', error);
        return NextResponse.json(
            { error: '获取支出记录详情失败' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request, context: RouteParams) {
    try {
        const params = await context.params;
        const expenseId = parseInt(params.id);
        if (isNaN(expenseId)) {
            return NextResponse.json(
                { error: '无效的ID' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { amount, category_id, date, note } = body;

        // 验证至少有一个要更新的字段
        if (!amount && !category_id && !date && note === undefined) {
            return NextResponse.json(
                { error: '没有要更新的字段' },
                { status: 400 }
            );
        }

        const updates: Record<string, any> = {};

        // 验证金额
        if (amount !== undefined) {
            if (typeof amount !== 'number' || amount <= 0) {
                return NextResponse.json(
                    { error: '无效的金额' },
                    { status: 400 }
                );
            }
            updates.amount = amount;
        }

        // 验证分类ID
        if (category_id !== undefined) {
            const category = DB.getCategoryById(category_id);
            if (!category) {
                return NextResponse.json(
                    { error: '无效的分类ID' },
                    { status: 400 }
                );
            }
            updates.category_id = category_id;
        }

        // 验证日期
        if (date !== undefined) {
            const expenseDate = parseISO(date);
            if (!isValid(expenseDate)) {
                return NextResponse.json(
                    { error: '无效的日期格式' },
                    { status: 400 }
                );
            }
            updates.date = date;
        }

        // 更新备注
        if (note !== undefined) {
            updates.note = note;
        }

        const success = DB.updateExpense(expenseId, updates);
        if (!success) {
            return NextResponse.json(
                { error: '支出记录不存在或无法更新' },
                { status: 404 }
            );
        }

        const expense = DB.getExpenseById(expenseId);
        return NextResponse.json(expense);
    } catch (error) {
        console.error('更新支出记录失败:', error);
        return NextResponse.json(
            { error: '更新支出记录失败' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, context: RouteParams) {
    try {
        const params = await context.params;
        const expenseId = parseInt(params.id);
        if (isNaN(expenseId)) {
            return NextResponse.json(
                { error: '无效的ID' },
                { status: 400 }
            );
        }

        const success = DB.deleteExpense(expenseId);
        if (!success) {
            return NextResponse.json(
                { error: '支出记录不存在或无法删除' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('删除支出记录失败:', error);
        return NextResponse.json(
            { error: '删除支出记录失败' },
            { status: 500 }
        );
    }
}