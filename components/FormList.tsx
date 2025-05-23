'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPlus, FaTrash, FaFileExport } from 'react-icons/fa';
import { Form } from '../types';
import { getForms, deleteForm } from '../utils/storage';
import { exportFormToExcel } from '../utils/excel';
import { format } from 'date-fns';
import { useToast } from './Toast';

export default function FormList() {
  const [forms, setForms] = useState<Form[]>([]);
  const toast = useToast();

  useEffect(() => {
    // Load forms from local storage
    const loadedForms = getForms();
    setForms(loadedForms);

  }, []);

  const handleDeleteForm = (formId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这个表单吗？')) {
      deleteForm(formId);
      setForms(forms.filter(form => form.id !== formId));
    }
  };

  const handleExportForm = async (form: Form, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.showToast("正在导出...", "info");
    const success = await exportFormToExcel(form);

    if (success) {
      toast.showToast("导出成功", "success");
    } else {
      toast.showToast("导出失败，请稍后再试", "error");
    }
  };

  // Replaced with Link component in the JSX

  // Group forms by surveyDate (most recent first)
  const groupedForms = forms
    .slice()
    .sort((a, b) => new Date(b.surveyDate).getTime() - new Date(a.surveyDate).getTime())
    .reduce((acc, form) => {
      acc[form.surveyDate] = acc[form.surveyDate] || [];
      acc[form.surveyDate].push(form);
      return acc;
    }, {} as Record<string, Form[]>);

  return (
    <div className="p-4 max-w-md mx-auto pb-6">
      <h1 className="text-2xl font-bold mb-2 mt-2">顺丰快递末端服务实地调研</h1>
      <p className="text-sm my-2">*所有数据储存在本地浏览器，请勿清除浏览器缓存！</p>
      <div className='border-b h-px w-full mb-4'></div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">表单列表</h2>
        <Link
          href="/form"
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
          aria-label="新建表单"
        >
          <FaPlus size={24} />
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="text-center py-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400 mb-4">暂无表单</p>
          <Link
            href="/form"
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg text-lg inline-block"
          >
            创建第一个表单
          </Link>
        </div>
      ) : (
        <div className='animate-fade-in-up'>
          {Object.entries(groupedForms).map(([date, group]) => (
            <div key={date}>
              <h3 className="text-lg font-semibold mt-6">{date}</h3>
              <ul className="space-y-4">
                {group.sort(
                  (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                 ).map(form => (
                  <li
                    key={form.id}
                    className="bg-[var(--card)] p-4 rounded-lg shadow-md dark:shadow-lg hover:shadow-lg dark:hover:shadow-xl transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <Link
                        href={`/entry?formId=${form.id}`}
                        className="block flex-1"
                      >
                        <div>
                          <h2 className="text-xl font-semibold">{form.name || '未命名表单'}</h2>
                          <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                            {form.cityName} | {form.branchCode} | {form.areaType}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
                            调研时间: {form.surveyDate}
                          </p>
                          <p className="text-gray-500 dark:text-gray-400 text-xs">
                            条目数: {form.entries.length}
                          </p>
                          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                            创建于: {format(new Date(form.createdAt), 'yyyy-MM-dd HH:mm')}
                          </p>
                        </div>
                      </Link>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => handleExportForm(form, e)}
                          className="p-2 text-green-600 dark:text-green-400/80 hover:bg-green-100 dark:hover:bg-green-900 rounded-full"
                          aria-label="导出表单"
                        >
                          <FaFileExport size={20} />
                        </button>
                        <button
                          onClick={(e) => handleDeleteForm(form.id, e)}
                          className="p-2 text-red-600 dark:text-red-400/80 hover:bg-red-100 dark:hover:bg-red-900 rounded-full"
                          aria-label="删除表单"
                        >
                          <FaTrash size={20} />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
