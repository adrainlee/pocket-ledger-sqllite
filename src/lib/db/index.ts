import Database from 'better-sqlite3';
import { initDatabase } from './init';
import { Category, Expense } from './schema';
import { format } from 'date-fns';

class DB {
    private static instance: Database.Database;

    static getInstance(): Database.Database {
        if (!DB.instance) {
            DB.instance = initDatabase();
        }
        return DB.instance;
    }

    // 分类相关方法
    static getAllCategories(): Category[] {
        const db = DB.getInstance();
        return db.prepare('SELECT * FROM categories ORDER BY id').all() as Category[];
    }

    static getCategoryById(id: number): Category | undefined {
        const db = DB.getInstance();
        return db.prepare('SELECT * FROM categories WHERE id = ?').get(id) as Category | undefined;
    }

    static createCategory(category: Omit<Category, 'id'>): number {
        const db = DB.getInstance();
        const result = db.prepare(
            'INSERT INTO categories (name, icon, color, is_default) VALUES (@name, @icon, @color, @is_default)'
        ).run(category);
        return result.lastInsertRowid as number;
    }

    static updateCategory(id: number, category: Partial<Category>): boolean {
        const db = DB.getInstance();
        const updates = Object.entries(category)
            .filter(([key]) => key !== 'id')
            .map(([key, value]) => `${key} = @${key}`)
            .join(', ');

        const result = db.prepare(`UPDATE categories SET ${updates} WHERE id = @id`).run({
            ...category,
            id
        });
        return result.changes > 0;
    }

    static deleteCategory(id: number): boolean {
        const db = DB.getInstance();
        const result = db.prepare('DELETE FROM categories WHERE id = ? AND is_default = 0').run(id);
        return result.changes > 0;
    }

    // 支出记录相关方法
    static getAllExpenses(): Expense[] {
        const db = DB.getInstance();
        return db.prepare('SELECT * FROM expenses ORDER BY date DESC, id DESC').all() as Expense[];
    }

    static getExpenseById(id: number): Expense | undefined {
        const db = DB.getInstance();
        return db.prepare('SELECT * FROM expenses WHERE id = ?').get(id) as Expense | undefined;
    }

    static getExpensesByDateRange(startDate: Date, endDate: Date): Expense[] {
        const db = DB.getInstance();
        return db.prepare(
            'SELECT * FROM expenses WHERE date BETWEEN ? AND ? ORDER BY date DESC, id DESC'
        ).all(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')) as Expense[];
    }

    static getExpensesByCategory(categoryId: number): Expense[] {
        const db = DB.getInstance();
        return db.prepare(
            'SELECT * FROM expenses WHERE category_id = ? ORDER BY date DESC, id DESC'
        ).all(categoryId) as Expense[];
    }

    static createExpense(expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'>): number {
        const db = DB.getInstance();
        const result = db.prepare(`
      INSERT INTO expenses (amount, category_id, date, note)
      VALUES (@amount, @category_id, @date, @note)
    `).run(expense);
        return result.lastInsertRowid as number;
    }

    static updateExpense(id: number, expense: Partial<Expense>): boolean {
        const db = DB.getInstance();
        const updates = Object.entries(expense)
            .filter(([key]) => !['id', 'created_at', 'updated_at'].includes(key))
            .map(([key, value]) => `${key} = @${key}`)
            .join(', ');

        const result = db.prepare(`
      UPDATE expenses 
      SET ${updates}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = @id
    `).run({
            ...expense,
            id
        });
        return result.changes > 0;
    }

    static deleteExpense(id: number): boolean {
        const db = DB.getInstance();
        const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
        return result.changes > 0;
    }

    // 统计相关方法
    static getExpenseStats(startDate: Date, endDate: Date) {
        const db = DB.getInstance();

        interface CategoryStats extends Category {
            count: number;
            total: number;
        }

        interface DateStats {
            date: string;
            count: number;
            total: number;
        }

        return {
            total: (db.prepare(`
        SELECT COALESCE(SUM(amount), 0) as total
        FROM expenses
        WHERE date BETWEEN ? AND ?
      `).get(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')) as { total: number }).total,

            byCategory: db.prepare(`
        SELECT 
          c.id,
          c.name,
          c.icon,
          c.color,
          COUNT(e.id) as count,
          COALESCE(SUM(e.amount), 0) as total
        FROM categories c
        LEFT JOIN expenses e ON c.id = e.category_id
          AND e.date BETWEEN ? AND ?
        GROUP BY c.id
        ORDER BY total DESC
      `).all(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')) as CategoryStats[],

            byDate: db.prepare(`
        SELECT 
          date,
          COUNT(*) as count,
          SUM(amount) as total
        FROM expenses
        WHERE date BETWEEN ? AND ?
        GROUP BY date
        ORDER BY date DESC
      `).all(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd')) as DateStats[]
        };
    }
}

export default DB;