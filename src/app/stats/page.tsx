'use client';

import { useState } from 'react';
import ExpenseStats from '@/components/ExpenseStats';

const TIME_RANGES = [
  { label: '近7天', days: 7 },
  { label: '近30天', days: 30 },
  { label: '近90天', days: 90 }
];

export default function StatsPage() {
  const [selectedDays, setSelectedDays] = useState(30);

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">支出统计</h1>
        <div className="flex space-x-2">
          {TIME_RANGES.map(({ label, days }) => (
            <button
              key={days}
              onClick={() => setSelectedDays(days)}
              className={`btn ${
                selectedDays === days
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="page-content">
        <ExpenseStats days={selectedDays} />
      </div>
    </div>
  );
}