import { NextResponse } from 'next/server';
import DB from '@/lib/db';

export async function GET() {
    try {
        const categories = DB.getAllCategories();
        return NextResponse.json(categories);
    } catch (error) {
        console.error('获取分类列表失败:', error);
        return NextResponse.json(
            { error: '获取分类列表失败' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, icon, color } = body;

        if (!name || !icon || !color) {
            return NextResponse.json(
                { error: '缺少必要字段' },
                { status: 400 }
            );
        }

        const id = DB.createCategory({
            name,
            icon,
            color,
            is_default: 0
        });

        const category = DB.getCategoryById(id);
        return NextResponse.json(category);
    } catch (error) {
        console.error('创建分类失败:', error);
        return NextResponse.json(
            { error: '创建分类失败' },
            { status: 500 }
        );
    }
}