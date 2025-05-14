'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaTrash, FaFileExport, FaPlus, FaEdit } from 'react-icons/fa';
import { Form, FormEntry } from '../types';
import { getFormById, deleteFormEntry } from '../utils/storage';
import { exportFormToExcel } from '../utils/excel';

interface FormTableProps {
  formId: string;
}

export default function FormTable({ formId }: FormTableProps) {
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);

  useEffect(() => {
    const loadedForm = getFormById(formId);
    setForm(loadedForm);
  }, [formId]);

  const handleDeleteEntry = (entryId: string) => {
    if (confirm('确定要删除这个条目吗？')) {
      const success = deleteFormEntry(formId, entryId);

      if (success) {
        // Refresh form data
        const updatedForm = getFormById(formId);
        setForm(updatedForm);
      } else {
        alert('删除条目失败');
      }
    }
  };

  const handleExportExcel = () => {
    if (form) {
      exportFormToExcel(form);
    }
  };

  const handleAddEntry = () => {
    router.push(`/entry?formId=${formId}`);
  };

  const handleEditEntry = (entryId: string) => {
    router.push(`/entry?formId=${formId}&entryId=${entryId}`);
  };

  const handleEditForm = () => {
    router.push(`/form?formId=${formId}`);
  };

  if (!form) {
    return <div className="p-4 text-center">加载中...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{form.name || '未命名表单'}</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleExportExcel}
            className="bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg flex items-center"
            aria-label="导出Excel"
          >
            <FaFileExport size={20} className="mr-2" />
            <span>导出Excel</span>
          </button>
          <button
            onClick={handleAddEntry}
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg flex items-center"
            aria-label="添加条目"
          >
            <FaPlus size={20} className="mr-2" />
            <span>添加条目</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold mb-2">表单信息</h2>
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent row click
              handleEditForm();
            }}
            className="text-blue-600 hover:text-blue-800 w-8 h-8"
            aria-label="编辑表单信息"
          >
            <FaEdit size={22} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div>
            <p className="text-gray-600 text-sm">城市名</p>
            <p className="font-medium">{form.cityName}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">调研时间</p>
            <p className="font-medium">{form.surveyDate}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">网点代码</p>
            <p className="font-medium">{form.branchCode}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">区域类型</p>
            <p className="font-medium">{form.areaType || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">小哥工号</p>
            <p className="font-medium">{form.courierCode || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600 text-sm">条目数</p>
            <p className="font-medium">{form.entries.length}</p>
          </div>
        </div>
      </div>

      {form.entries.length === 0 ? (
        <div className="text-center py-8 bg-gray-100 rounded-lg">
          <p className="text-gray-500 mb-4">暂无条目</p>
          <button
            onClick={handleAddEntry}
            className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg text-lg"
          >
            添加第一个条目
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  运单号后四位
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  订单妥投
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  派至三方
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  客户交互
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  客户寄件
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  电退交互
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  备注
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {form.entries.map((entry: FormEntry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleEditEntry(entry.id)}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    {entry.trackingNumberLastFour}
                  </td>
                  <BoolFormCell value={entry.addressDelivered} />
                  <BoolFormCell value={entry.thirdPartyDelivery} />
                  <BoolFormCell value={entry.customerInteraction} />
                  <BoolFormCell value={entry.customerInteractionSending} />
                  <BoolFormCell value={entry.customerInteractionReturn} />
                  <td className="px-4 py-3">
                    {entry.notes || '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          handleEditEntry(entry.id);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                        aria-label="编辑条目"
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          handleDeleteEntry(entry.id);
                        }}
                        className="text-red-600 hover:text-red-800"
                        aria-label="删除条目"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6">
        <button
          onClick={handleAddEntry}
          className="bg-blue-500 hover:bg-blue-600 text-white p-3 py-4 rounded-lg flex items-center w-full justify-center mb-4"
          aria-label="添加条目"
        >
          <FaPlus size={20} className="mr-2" />
          <span>添加条目</span>
        </button>
        <button
          onClick={() => router.push('/')}
          className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-4 rounded-lg text-lg"
        >
          返回首页
        </button>
      </div>
    </div>
  );
}


function BoolFormCell ({value}: {value: boolean}) {
  return (
    <td className={"px-4 py-3 whitespace-nowrap " + (value ? "text-green-600" : "text-red-300")}>
      {value ? '✓' : '✗'}
    </td>
  )
}