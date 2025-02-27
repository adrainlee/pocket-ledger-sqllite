'use client';

import { useState, useEffect } from 'react';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek } from 'date-fns';
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

interface StatsData {
  startDate: string;
  endDate: string;
  total: number;
  byCategory: CategoryStats[];
}

const DailyAndWeeklyExpenseStats = () => {
  const [dailyStats, setDailyStats] = useState<StatsData | null>(null);
  const [weeklyStats, setWeeklyStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        setError('');

        // 本日数据
        const today = new Date();
        const dailyStart = startOfDay(today);
        const dailyEnd = endOfDay(today);

        // 本周数据（从周一到周日）
        const weekStart = startOfWeek(today, { locale: zhCN });
        const weekEnd = endOfWeek(today, { locale: zhCN });

        // 并行请求数据
        const [dailyData, weeklyData] = await Promise.all([
          fetchApi('/api/expenses/stats', {
            params: {
              startDate: format(dailyStart, 'yyyy-MM-dd'),
              endDate: format(dailyEnd, 'yyyy-MM-dd'),
            },
          }),
          fetchApi('/api/expenses/stats', {
            params: {
              startDate: format(weekStart, 'yyyy-MM-dd'),
              endDate: format(weekEnd, 'yyyy-MM-dd'),
            },
          }),
        ]);

        setDailyStats(dailyData);
        setWeeklyStats(weeklyData);
      } catch (error) {
        console.error('获取统计数据失败:', error);
        setError('获取统计数据失败，请重试');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (isLoading) {
    return <div className="text-center py-4">加载中...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  // 如果今天和本周都没有支出记录
  if ((!dailyStats || dailyStats.total === 0) && (!weeklyStats || weeklyStats.total === 0)) {
    return <div className="text-center py-4 text-gray-500">暂无本日和本周支出记录</div>;
  }

  return (
    <div className="space-y-6">
      {/* 本日支出 */}
      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium">今日支出</h3>
          {dailyStats && (
            <div className="text-xl font-bold">¥{dailyStats.total.toFixed(2)}</div>
          )}
        </div>
        
        {dailyStats && dailyStats.total > 0 ? (
          <div className="space-y-3">
            {dailyStats.byCategory
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
                      <div className="text-xs text-gray-500">
                        {((category.total / dailyStats.total) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(category.total / dailyStats.total) * 100}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-2">暂无今日支出</div>
        )}
      </div>

      {/* 本周支出 */}
      <div className="card">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-medium">本周支出</h3>
          {weeklyStats && (
            <div className="text-xl font-bold">¥{weeklyStats.total.toFixed(2)}</div>
          )}
        </div>
        
        {weeklyStats && weeklyStats.total > 0 ? (
          <div className="space-y-3">
            {weeklyStats.byCategory
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
                      <div className="text-xs text-gray-500">
                        {((category.total / weeklyStats.total) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(category.total / weeklyStats.total) * 100}%`,
                        backgroundColor: category.color,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-2">暂无本周支出</div>
        )}
      </div>
    </div>
  );
};

export default DailyAndWeeklyExpenseStats;