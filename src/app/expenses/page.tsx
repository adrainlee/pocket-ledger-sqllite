'use client';

import { useState } from 'react';
import ExpenseList from '@/components/ExpenseList';
import { fetchApi } from '@/lib/api';

export default function ExpensesPage() {
  const handleDelete = async (id: number) => {
    try {
      await fetchApi(`/api/expenses/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('删除支出记录失败:', error);
      throw error;
    }
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">支出明细</h1>
      </header>

      <div className="page-content">
        <ExpenseList onDelete={handleDelete} />
      </div>
    </div>
  );
}