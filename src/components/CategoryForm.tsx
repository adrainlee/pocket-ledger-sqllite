'use client';

import { useState } from 'react';
import { Category } from '@/lib/db/schema';

interface CategoryFormProps {
  category?: Category;
  onSubmit: (data: {
    name: string;
    icon: string;
    color: string;
  }) => Promise<void>;
  onCancel: () => void;
}

const EMOJI_OPTIONS = [
  '🍽️', '🚗', '🛍️', '🎮', '🏠', '📝', '💼', '📚', '🎵', '🏃‍♂️',
  '🎬', '🍺', '✈️', '💊', '👕', '💇‍♂️', '🎁', '📱', '🏋️‍♂️', '🎨'
];

const COLOR_OPTIONS = [
  '#FF5722', '#2196F3', '#9C27B0', '#4CAF50', '#795548', '#607D8B',
  '#E91E63', '#3F51B5', '#009688', '#FFC107', '#FF4081', '#00BCD4',
  '#8BC34A', '#FF9800', '#9E9E9E', '#673AB7', '#CDDC39', '#F44336',
  '#03A9F4', '#FF5252'
];

const CategoryForm = ({ category, onSubmit, onCancel }: CategoryFormProps) => {
  const [name, setName] = useState(category?.name || '');
  const [icon, setIcon] = useState(category?.icon || EMOJI_OPTIONS[0]);
  const [color, setColor] = useState(category?.color || COLOR_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('请输入分类名称');
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        icon,
        color
      });
    } catch (error) {
      console.error('提交分类失败:', error);
      setError('提交失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="form-group">
        <label className="form-label" htmlFor="name">
          分类名称
        </label>
        <input
          type="text"
          id="name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="请输入分类名称"
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">图标</label>
        <div className="grid grid-cols-10 gap-2">
          {EMOJI_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className={`aspect-square flex items-center justify-center text-xl rounded-lg border ${
                icon === emoji
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setIcon(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">颜色</label>
        <div className="grid grid-cols-10 gap-2">
          {COLOR_OPTIONS.map((colorOption) => (
            <button
              key={colorOption}
              type="button"
              className={`aspect-square rounded-lg border-2 ${
                color === colorOption
                  ? 'border-gray-900'
                  : 'border-transparent hover:border-gray-300'
              }`}
              style={{ backgroundColor: colorOption }}
              onClick={() => setColor(colorOption)}
            />
          ))}
        </div>
      </div>

      {error && <p className="error-text">{error}</p>}

      <div className="flex space-x-2">
        <button
          type="submit"
          className="btn btn-primary flex-1"
          disabled={isLoading}
        >
          {isLoading ? '保存中...' : category ? '保存修改' : '添加分类'}
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onCancel}
          disabled={isLoading}
        >
          取消
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;