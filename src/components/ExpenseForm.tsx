import { useState, useEffect } from 'react';
import { Category } from '@/lib/db/schema';

interface ExpenseFormProps {
  onSubmit: (data: {
    amount: number;
    category_id: number;
    date: string;
    note: string;
  }) => Promise<void>;
}

const ExpenseForm = ({ onSubmit }: ExpenseFormProps) => {
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('获取分类失败');
      const data = await response.json();
      setCategories(data);
      if (data.length > 0 && !categoryId) {
        setCategoryId(String(data[0].id));
      }
    } catch (error) {
      console.error('获取分类失败:', error);
      setError('获取分类失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!amount || !categoryId || !date) {
      setError('请填写必要信息');
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('请输入有效金额');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        amount: amountNum,
        category_id: parseInt(categoryId),
        date,
        note
      });
      
      // 重置表单
      setAmount('');
      setNote('');
      setDate(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error('提交支出记录失败:', error);
      setError('提交失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label className="form-label" htmlFor="amount">
          金额
        </label>
        <input
          type="number"
          id="amount"
          className="input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="请输入支出金额"
          step="0.01"
          min="0"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="category">
          分类
        </label>
        <select
          id="category"
          className="input"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.icon} {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="date">
          日期
        </label>
        <input
          type="date"
          id="date"
          className="input"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="note">
          备注
        </label>
        <input
          type="text"
          id="note"
          className="input"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="添加备注（可选）"
        />
      </div>

      {error && <p className="error-text">{error}</p>}

      <button
        type="submit"
        className="btn btn-primary w-full"
        disabled={isLoading}
      >
        {isLoading ? '记录中...' : '记录支出'}
      </button>
    </form>
  );
};

export default ExpenseForm;