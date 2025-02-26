import Database from 'better-sqlite3';
import { DEFAULT_CATEGORIES } from './schema';

export function initDatabase() {
    const db = new Database('pocket-ledger.db');

    // 启用外键约束
    db.pragma('foreign_keys = ON');

    // 创建categories表
    db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      is_default INTEGER DEFAULT 0
    )
  `);

    // 创建expenses表
    db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      category_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      note TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    )
  `);

    // 插入默认分类
    const insertCategory = db.prepare(`
    INSERT INTO categories (name, icon, color, is_default)
    VALUES (@name, @icon, @color, @is_default)
  `);

    // 检查是否已经存在默认分类
    const existingCategories = db.prepare('SELECT COUNT(*) as count FROM categories WHERE is_default = 1').get();

    if (existingCategories.count === 0) {
        // 使用事务插入默认分类
        const transaction = db.transaction(() => {
            for (const category of DEFAULT_CATEGORIES) {
                insertCategory.run(category);
            }
        });

        transaction();
    }

    return db;
}