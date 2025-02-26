import { useState, useEffect } from 'react';
import { Expense, Category } from '@/lib/db/schema';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface ExpenseWithCategory extends Expense {
  category: Category;
}

interface ExpenseListProps {
  onDelete?: (id: number) => Promise<void>;
}

const ExpenseList = ({ onDelete }: ExpenseListProps) => {
  const [expenses, setExpenses] = useState<ExpenseWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setIsLoading(true);
      setError('');

      // 获取支出记录
      const expensesResponse = await fetch('/api/expenses');
      if (!expensesResponse.ok) throw new Error('获取支出记录失败');
      const expensesData = await expensesResponse.json();

      // 获取分类信息
      const categoriesResponse = await fetch('/api/categories');
      if (!categoriesResponse.ok) throw new Error('获取分类信息失败');
      const categoriesData: Category[] = await categoriesResponse.json();

      // 合并支出记录和分类信息
      const expensesWithCategory = expensesData.map((expense: Expense) => ({
        ...expense,
        category: categoriesData.find(c => c.id === expense.category_id) || {
          id: expense.category_id,
          name: '未知分类',
          icon: '❓',
          color: '#999999',
          is_default: 0
        }
      }));

      setExpenses(expensesWithCategory);
    } catch (error) {
      console.error('获取数据失败:', error);
      setError('获取数据失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!onDelete) return;
    
    if (!confirm('确定要删除这条记录吗？')) return;

    try {
      await onDelete(id);
      await fetchExpenses(); // 重新加载列表
    } catch (error) {
      console.error('删除失败:', error);
      alert('删除失败，请重试');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        还没有支出记录，快去记一笔吧
      </div>
    );
  }

  // 按日期分组显示支出记录
  const groupedExpenses: Record<string, ExpenseWithCategory[]> = {};
  expenses.forEach(expense => {
    const date = expense.date;
    if (!groupedExpenses[date]) {
      groupedExpenses[date] = [];
    }
    groupedExpenses[date].push(expense);
  });

  return (
    <div className="space-y-6">
      {Object.entries(groupedExpenses)
        .sort(([dateA], [dateB]) => dateB.localeCompare(dateA))
        .map(([date, dayExpenses]) => (
          <div key={date} className="space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-500 px-4">
              <div>{format(new Date(date), 'PPP', { locale: zhCN })}</div>
              <div>
                支出：¥
                {dayExpenses
                  .reduce((sum, exp) => sum + exp.amount, 0)
                  .toFixed(2)}
              </div>
            </div>
            <div className="card divide-y divide-gray-100">
              {dayExpenses.map(expense => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center space-x-3">
                    <span
                      className="text-2xl"
                      style={{ color: expense.category.color }}
                    >
                      {expense.category.icon}
                    </span>
                    <div>
                      <div className="font-medium">
                        {expense.category.name}
                      </div>
                      {expense.note && (
                        <div className="text-sm text-gray-500">
                          {expense.note}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="font-medium">
                        ¥{expense.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(expense.date), 'HH:mm')}
                      </div>
                    </div>
                    {onDelete && (
                      <button
                        onClick={() => expense.id && handleDelete(expense.id)}
                        className="text-red-500 hover:text-red-600 p-1"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
};

export default ExpenseList;