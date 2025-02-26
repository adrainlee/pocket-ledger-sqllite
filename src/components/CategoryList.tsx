import { useState, useEffect } from 'react';
import { Category } from '@/lib/db/schema';

interface CategoryListProps {
  onDelete?: (id: number) => Promise<void>;
  onEdit?: (category: Category) => void;
}

const CategoryList = ({ onDelete, onEdit }: CategoryListProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await fetch('/api/categories');
      if (!response.ok) throw new Error('获取分类失败');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('获取分类失败:', error);
      setError('获取分类失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!onDelete) return;
    
    if (!confirm('确定要删除这个分类吗？删除后无法恢复。')) return;

    try {
      await onDelete(id);
      await fetchCategories(); // 重新加载列表
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

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        还没有自定义分类
      </div>
    );
  }

  return (
    <div className="card divide-y divide-gray-100">
      {categories.map(category => (
        <div
          key={category.id}
          className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
        >
          <div className="flex items-center space-x-3">
            <span
              className="text-2xl"
              style={{ color: category.color }}
            >
              {category.icon}
            </span>
            <div className="font-medium">{category.name}</div>
          </div>
          <div className="flex items-center space-x-2">
            {onEdit && !category.is_default && (
              <button
                onClick={() => onEdit(category)}
                className="text-blue-500 hover:text-blue-600 p-1"
              >
                ✎
              </button>
            )}
            {onDelete && !category.is_default && (
              <button
                onClick={() => category.id && handleDelete(category.id)}
                className="text-red-500 hover:text-red-600 p-1"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryList;