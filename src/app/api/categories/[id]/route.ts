import { NextRequest, NextResponse } from 'next/server';
import DB from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const categoryId = parseInt(id);
        if (isNaN(categoryId)) {
            return NextResponse.json(
                { error: '无效的ID' },
                { status: 400 }
            );
        }

        const category = DB.getCategoryById(categoryId);
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

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const categoryId = parseInt(id);
        if (isNaN(categoryId)) {
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
        const success = DB.updateCategory(categoryId, {
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

        const category = DB.getCategoryById(categoryId);
        return NextResponse.json(category);
    } catch (error) {
        console.error('更新分类失败:', error);
        return NextResponse.json(
            { error: '更新分类失败' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const categoryId = parseInt(id);
        if (isNaN(categoryId)) {
            return NextResponse.json(
                { error: '无效的ID' },
                { status: 400 }
            );
        }

        const success = DB.deleteCategory(categoryId);
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