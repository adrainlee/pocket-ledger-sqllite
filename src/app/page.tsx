'use client';

import { useState } from 'react';
import ExpenseForm from '@/components/ExpenseForm';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

export default function Home() {
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (data: {
    amount: number;
    category_id: number;
    date: string;
    note: string;
  }) => {
    try {
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('提交失败');
      }

      setSuccessMessage('记账成功！');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('提交支出记录失败:', error);
      throw error;
    }
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">记账</h1>
        <div className="text-sm text-gray-500">
          {format(new Date(), 'PPP', { locale: zhCN })}
        </div>
      </header>

      <div className="page-content">
        <div className="card">
          <ExpenseForm onSubmit={handleSubmit} />
          {successMessage && (
            <div className="success-text text-center mt-4">{successMessage}</div>
          )}
        </div>
      </div>
    </div>
  );
}
