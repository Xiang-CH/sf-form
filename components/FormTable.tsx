'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaTrash, FaFileExport, FaPlus, FaEdit } from 'react-icons/fa';
import { Form, FormEntry } from '../types';
import { getFormById, deleteFormEntry } from '../utils/storage';
import { exportFormToExcel } from '../utils/excel';
import { useToast } from './Toast';

import { exportFormToExcelServer } from '../actions/exportExcel';

interface FormTableProps {
  formId: string;
}

export default function FormTable({ formId }: FormTableProps) {
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<Form | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const loadedForm = getFormById(formId);
    if (!loadedForm) {
      router.push('/');
      return;
    }
    setForm(loadedForm);
  }, [formId]);

  useEffect(() => {
    if (form) {
      form.entries.forEach((entry) => {
        router.prefetch(`/entry?formId=${formId}&entryId=${entry.id}`);
      });
    }
  }, [formId, router]);
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

  const handleExportExcel = async () => {
    if (form) {
      toast.showToast("正在导出...", "info");
      const success = await exportFormToExcel(form);

      if (success) {
        toast.showToast("导出成功", "success");
      } else {
        toast.showToast("导出失败，请稍后再试", "error");
      }
    } else {
      toast.showToast("空白表单，导出失败", "error");
    }
  };

  const handleExportExcelServer = async () => {
    if (form) {
      toast.showToast("正在导出...", "info");
      try {
        const result = await exportFormToExcelServer(JSON.stringify(form));
        console.log("Server export result:", result);

        if (result.success) {
          if (result.data) {
            toast.showToast("导出成功", "success");
            setDownloadUrl(result.data);
          }
          // Show warning if there was an error with Qiniu upload
          if (result.error) {
            console.warn("Server export warning:", result.error);
            toast.showToast("文件已下载，但云存储上传失败", "warning");
          }
        } else {
          toast.showToast(result.error || "导出失败，请稍后再试", "error");
        }
      } catch (error) {
        console.error("Server export error:", error);
        toast.showToast("导出失败，请稍后再试", "error");
      }
    } else {
      toast.showToast("空白表单，导出失败", "error");
    }
  };

  const handleEditEntry = (entryId: string) => {
    router.push(`/entry?formId=${formId}&entryId=${entryId}`);
  };

  if (!form) {
    return <div className="p-4 text-center">加载中...</div>;
  }

  return (
    <div className="p-4 max-w-4xl mx-auto animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{form.name || '未命名表单'}</h1>
        <div className="flex space-x-2">
          <button
            onClick={handleExportExcel}
            className="bg-green-500 dark:bg-green-500/80 hover:bg-green-600 text-white p-3 rounded-lg flex items-center"
            aria-label="导出Excel"
          >
            <FaFileExport size={20} className="mr-2" />
            <span>导出Excel</span>
          </button>
          <Link
            href={`/entry?formId=${formId}`}
            className="bg-blue-500 dark:bg-blue-500/90 hover:bg-blue-600 text-white p-3 rounded-lg flex items-center"
            aria-label="添加条目"
          >
            <FaPlus size={20} className="mr-2" />
            <span>添加条目</span>
          </Link>
        </div>
      </div>

      <div className="bg-[var(--card)] p-4 rounded-lg shadow dark:shadow-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold mb-2">表单信息</h2>
          <Link
            href={`/form?formId=${formId}`}
            className="text-blue-600 dark:text-blue-400/90 hover:text-blue-800 dark:hover:text-blue-600 w-8 h-8 flex items-center justify-center"
            aria-label="编辑表单信息"
          >
            <FaEdit size={22} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">城市名</p>
            <p className="font-medium">{form.cityName}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">调研时间</p>
            <p className="font-medium">{form.surveyDate}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">网点代码</p>
            <p className="font-medium">{form.branchCode}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">区域类型</p>
            <p className="font-medium">{form.areaType || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">小哥工号</p>
            <p className="font-medium">{form.courierCode || '-'}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-gray-300 text-sm">条目数</p>
            <p className="font-medium">{form.entries.length}</p>
          </div>
        </div>
      </div>

      {form.entries.length === 0 ? (
        <div className="text-center py-8 bg-gray-100 dark:bg-gray-700 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">暂无条目</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-[var(--card)] rounded-lg shadow dark:shadow-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-[var(--card)]">
              <tr>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  运单号后四位
                </th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  订单妥投
                </th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  派至三方
                </th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  客户交互
                </th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  客户寄件
                </th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  电退交互
                </th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  备注
                </th>
                <th className="px-3 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-[var(--card)] divide-y divide-gray-200 dark:divide-gray-700">
              {form.entries.map((entry: FormEntry) => (
                <tr
                  key={entry.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
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
                    <td className="px-4 py-3 dark:text-gray-300">
                      {entry.notes || '-'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex space-x-3">
                      <Link
                        href={`/entry?formId=${formId}&entryId=${entry.id}`}
                        className="text-blue-600 dark:text-blue-400/90 hover:text-blue-800 dark:hover:text-blue-600 w-6 h-6 flex items-center justify-center"
                        aria-label="编辑条目"
                      >
                        <FaEdit size={22} />
                      </Link>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent row click
                            handleDeleteEntry(entry.id);
                          }}
                          className="text-red-600 dark:text-red-400/80 hover:text-red-800 dark:hover:text-red-600 w-6 h-6"
                          aria-label="删除条目"
                        >
                          <FaTrash size={19} />
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
        <Link
          href={`/entry?formId=${formId}`}
          className="bg-blue-500 dark:bg-blue-500/90 hover:bg-blue-600 text-white p-3 py-4 rounded-lg flex items-center w-full justify-center mb-4"
          aria-label="添加条目"
        >
          <FaPlus size={20} className="mr-2" />
          <span>添加条目</span>
        </Link>
        <Link
          href="/"
          className="w-full bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg text-lg text-center block"
        >
          返回首页
        </Link>
      </div>
      <div className="mt-10">
        <button
          onClick={handleExportExcelServer}
          className="w-full bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 px-4 rounded-lg text-lg text-center block"
        >
          若下载失败，请点击这里使用服务器导出
        </button>
        {downloadUrl && (
          <div>
          <a
            href={downloadUrl}
            download={`${form.name || '表单'}_${form.branchCode}_${form.surveyDate}_${form.courierCode}.xlsx`}
            className="w-full mt-2 bg-green-500 dark:bg-green-500/80 hover:bg-green-600 text-white py-3 px-4 rounded-lg text-lg text-center block"
          >
            点击再次下载Excel文件
          </a>
          <span>{downloadUrl}</span>
          </div>
        )}
      </div>
    </div>
  );
}


function BoolFormCell ({value}: {value: boolean}) {
  return (
    <td className={"px-4 py-3 whitespace-nowrap " + (value ? "text-green-600 dark:text-green-400" : "text-red-300 dark:text-red-500")}>
      {value ? '✓' : '✗'}
    </td>
  )
}