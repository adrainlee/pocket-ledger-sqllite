import { useState, useEffect, useCallback } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { fetchApi } from '@/lib/api';

interface CategoryStats {
  id: number;
  name: string;
  icon: string;
  color: string;
  count: number;
  total: number;
}

interface DateStats {
  date: string;
  count: number;
  total: number;
}

interface StatsData {
  startDate: string;
  endDate: string;
  total: number;
  byCategory: CategoryStats[];
  byDate: DateStats[];
}

interface ExpenseStatsProps {
  days?: number;
}

const ExpenseStats = ({ days = 30 }: ExpenseStatsProps) => {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError('');

      const end = endOfDay(new Date());
      const start = startOfDay(subDays(end, days - 1));

      const data = await fetchApi('/api/expenses/stats', {
        params: {
          startDate: format(start, 'yyyy-MM-dd'),
          endDate: format(end, 'yyyy-MM-dd')
        }
      });
      setStats(data);
    } catch (error) {
      console.error('获取统计数据失败:', error);
      setError('获取统计数据失败，请重试');
    } finally {
      setIsLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (isLoading) {
    return <div className="text-center py-8">加载中...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">{error}</div>;
  }

  if (!stats) {
    return <div className="text-center py-8 text-gray-500">暂无数据</div>;
  }

  return (
    <div className="space-y-6">
      {/* 总支出 */}
      <div className="card text-center">
        <div className="text-gray-500 mb-2">总支出</div>
        <div className="text-3xl font-bold">¥{stats.total.toFixed(2)}</div>
        <div className="text-sm text-gray-500 mt-2">
          {format(new Date(stats.startDate), 'MM/dd', { locale: zhCN })} -{' '}
          {format(new Date(stats.endDate), 'MM/dd', { locale: zhCN })}
        </div>
      </div>

      {/* 分类统计 */}
      <div className="card">
        <h3 className="text-lg font-medium mb-4">分类统计</h3>
        <div className="space-y-4">
          {stats.byCategory
            .filter(cat => cat.total > 0)
            .sort((a, b) => b.total - a.total)
            .map(category => (
              <div key={category.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span style={{ color: category.color }}>{category.icon}</span>
                    <span>{category.name}</span>
                  </div>
                  <div className="text-right">
                    <div>¥{category.total.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">
                      {category.count}笔
                    </div>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(category.total / stats.total) * 100}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* 日期统计 */}
      <div className="card">
        <h3 className="text-lg font-medium mb-4">支出趋势</h3>
        <div className="space-y-2">
          {stats.byDate
            .sort((a, b) => b.date.localeCompare(a.date))
            .map(day => (
              <div key={day.date} className="flex items-center space-x-2">
                <div className="w-20 text-sm text-gray-500">
                  {format(new Date(day.date), 'MM/dd', { locale: zhCN })}
                </div>
                <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${(day.total / stats.total) * 100}%`,
                    }}
                  />
                </div>
                <div className="w-24 text-right">¥{day.total.toFixed(2)}</div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default ExpenseStats;