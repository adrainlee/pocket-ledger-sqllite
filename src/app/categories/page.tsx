'use client';

import { useState } from 'react';
import CategoryList from '@/components/CategoryList';
import CategoryForm from '@/components/CategoryForm';
import { Category } from '@/lib/db/schema';
import { fetchApi } from '@/lib/api';

export default function CategoriesPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | undefined>();

  const handleAdd = async (data: { name: string; icon: string; color: string }) => {
    try {
      await fetchApi('/api/categories', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      setShowForm(false);
    } catch (error) {
      console.error('创建分类失败:', error);
      throw error;
    }
  };

  const handleEdit = async (data: { name: string; icon: string; color: string }) => {
    if (!editingCategory?.id) return;

    try {
      await fetchApi(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      setShowForm(false);
      setEditingCategory(undefined);
    } catch (error) {
      console.error('更新分类失败:', error);
      throw error;
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await fetchApi(`/api/categories/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('删除分类失败:', error);
      throw error;
    }
  };

  const handleEditClick = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCategory(undefined);
  };

  return (
    <div>
      <header className="page-header">
        <h1 className="page-title">分类管理</h1>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            添加分类
          </button>
        )}
      </header>

      <div className="page-content">
        {showForm ? (
          <div className="card">
            <CategoryForm
              category={editingCategory}
              onSubmit={editingCategory ? handleEdit : handleAdd}
              onCancel={handleCancel}
            />
          </div>
        ) : (
          <CategoryList
            onDelete={handleDelete}
            onEdit={handleEditClick}
          />
        )}
      </div>
    </div>
  );
}