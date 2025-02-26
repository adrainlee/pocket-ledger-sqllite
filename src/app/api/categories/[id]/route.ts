import { NextResponse } from 'next/server';
import DB from '@/lib/db';

interface RouteParams {
    params: {
        id: string;
    };
}

export async function GET(request: Request, { params }: RouteParams) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json(
                { error: '无效的ID' },
                { status: 400 }
            );
        }

        const category = DB.getCategoryById(id);
        if (!category) {
            return NextResponse.json(
                { error: '分类不存在' },
                { status: 404 }
            );
        }

        return NextResponse.json(category);
    } catch (error) {
        console.error('获取分类详情失败:', error);
        return NextResponse.json(
            { error: '获取分类详情失败' },
            { status: 500 }
        );
    }
}

export async function PUT(request: Request, { params }: RouteParams) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json(
                { error: '无效的ID' },
                { status: 400 }
            );
        }

        const body = await request.json();
        const { name, icon, color } = body;

        if (!name && !icon && !color) {
            return NextResponse.json(
                { error: '没有要更新的字段' },
                { status: 400 }
            );
        }

        const success = DB.updateCategory(id, {
            ...(name && { name }),
            ...(icon && { icon }),
            ...(color && { color })
        });

        if (!success) {
            return NextResponse.json(
                { error: '分类不存在或无法更新' },
                { status: 404 }
            );
        }

        const category = DB.getCategoryById(id);
        return NextResponse.json(category);
    } catch (error) {
        console.error('更新分类失败:', error);
        return NextResponse.json(
            { error: '更新分类失败' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request, { params }: RouteParams) {
    try {
        const id = parseInt(params.id);
        if (isNaN(id)) {
            return NextResponse.json(
                { error: '无效的ID' },
                { status: 400 }
            );
        }

        const success = DB.deleteCategory(id);
        if (!success) {
            return NextResponse.json(
                { error: '分类不存在或无法删除' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('删除分类失败:', error);
        return NextResponse.json(
            { error: '删除分类失败' },
            { status: 500 }
        );
    }
}