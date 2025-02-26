export interface Expense {
    id?: number;
    amount: number;
    category_id: number;
    date: string;
    note: string;
    created_at?: string;
    updated_at?: string;
}

export interface Category {
    id?: number;
    name: string;
    icon: string;
    color: string;
    is_default: number;
}

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
    {
        name: '餐饮',
        icon: '🍽️',
        color: '#FF5722',
        is_default: 1
    },
    {
        name: '交通',
        icon: '🚗',
        color: '#2196F3',
        is_default: 1
    },
    {
        name: '购物',
        icon: '🛍️',
        color: '#9C27B0',
        is_default: 1
    },
    {
        name: '娱乐',
        icon: '🎮',
        color: '#4CAF50',
        is_default: 1
    },
    {
        name: '居住',
        icon: '🏠',
        color: '#795548',
        is_default: 1
    },
    {
        name: '其他',
        icon: '📝',
        color: '#607D8B',
        is_default: 1
    }
];