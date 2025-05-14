'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FormEntry as FormEntryType } from '../types';
import { addFormEntry, getFormById, getFormEntryById, updateFormEntry } from '../utils/storage';
import { useToast } from './Toast';

interface FormEntryProps {
  formId: string;
  entryId?: string | null; // Optional - if provided, we're in edit mode
}

export default function FormEntry({ formId, entryId }: FormEntryProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isEditMode] = useState(!!entryId);
  const [entryData, setEntryData] = useState<Omit<FormEntryType, 'id' | 'createdAt'>>({
    trackingNumberLastFour: '',
    addressDelivered: false,
    thirdPartyDelivery: false,
    customerInteraction: false,
    customerInteractionSending: false,
    customerInteractionReturn: false,
    notes: ''
  });

  const [currentEntryCount, setCurrentEntryCount] = useState(() => {
    const form = getFormById(formId);
    return form ? form.entries.length : 0;
  });

  // Load entry data if in edit mode
  useEffect(() => {
    if (entryId) {
      const entry = getFormEntryById(formId, entryId);
      if (entry) {
        // Remove id and createdAt from the entry data
        const { ...entryDataWithoutId } = entry;
        setEntryData(entryDataWithoutId);
      } else {
        showToast('找不到条目', 'error');
        router.push(`/table?formId=${formId}`);
      }
    }
  }, [entryId, formId, router, showToast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setEntryData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'trackingNumberLastFour') {
      // Only allow digits for tracking number
      const digitsOnly = value.replace(/[^a-zA-Z0-9]/g, '');
      setEntryData(prev => ({ ...prev, [name]: digitsOnly }));
    } else {
      setEntryData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!entryData.trackingNumberLastFour) {
      showToast('请填写运单号后四位', 'error');
      return;
    }

    if (entryData.trackingNumberLastFour.length !== 4) {
      showToast('运单号后四位必须是4位数字', 'error');
      return;
    }

    let success = false;

    if (isEditMode && entryId) {
      // Update existing entry
      const updatedEntry = updateFormEntry(formId, entryId, entryData);
      success = !!updatedEntry;

      if (success) {
        showToast('条目已更新', 'success');
        // Navigate back to table view after successful edit
        router.push(`/table?formId=${formId}`);
      } else {
        showToast('更新条目失败', 'error');
      }
    } else {
      // Add new entry
      const newEntry = addFormEntry(formId, entryData);
      success = !!newEntry;

      if (success) {
        // Clear form for next entry
        setEntryData({
          trackingNumberLastFour: '',
          addressDelivered: false,
          thirdPartyDelivery: false,
          customerInteraction: false,
          customerInteractionSending: false,
          customerInteractionReturn: false,
          notes: ''
        });

        setCurrentEntryCount(prev => prev + 1);

        // Show success message
        showToast(`条目已保存！这是第 ${currentEntryCount + 1} 个条目。`, 'success');
      } else {
        showToast('保存条目失败', 'error');
      }
    }
  };

  const handleViewTable = () => {
    router.push(`/table?formId=${formId}`);
  };

  const handleCheckboxContainerClick = (name: string) => {
    setEntryData(prev => ({ ...prev, [name]: !prev[name as keyof typeof prev] }));
  };

  return (
    <div className="p-4 max-w-md mx-auto pb-2">

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{isEditMode ? '编辑条目' : '添加条目'}</h1>
        {!isEditMode && (
          <div className="text-sm bg-blue-100 text-blue-800 py-1 px-3 rounded-full">
            已添加: {currentEntryCount}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          {/* <label className="block text-gray-700 text-lg mb-2" htmlFor="trackingNumberLastFour">
            运单号后四位
          </label> */}
          <input
            type="text"
            inputMode="text"
            pattern="[A-Za-z0-9]{4}"
            id="trackingNumberLastFour"
            name="trackingNumberLastFour"
            value={entryData.trackingNumberLastFour}
            onChange={handleChange}
            className="w-full p-4 border border-gray-300 rounded-lg text-xl"
            placeholder="输入运单号后四位"
            maxLength={4}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* First column */}
          <div
            className={`flex items-center p-3 rounded-lg border border-gray-200 shadow-sm ${entryData.addressDelivered ? 'bg-green-100' : 'bg-gray-50'} cursor-pointer`}
            onClick={() => handleCheckboxContainerClick('addressDelivered')}
          >
            <input
              type="checkbox"
              id="addressDelivered"
              name="addressDelivered"
              checked={entryData.addressDelivered}
              onChange={handleChange}
              className="w-5 h-5"
              onClick={(e) => e.stopPropagation()}
            />
            <span
              className="ml-2 block text-base cursor-pointer"
              // htmlFor="addressDelivered"
              // onClick={(e) => {
              //   e.preventDefault();
              //   handleCheckboxContainerClick('addressDelivered');
              // }}
            >
              订单妥投
            </span>
          </div>

          <div
            className={`flex items-center p-3 rounded-lg border border-gray-200 shadow-sm ${entryData.thirdPartyDelivery ? 'bg-green-100' : 'bg-gray-50'} cursor-pointer`}
            onClick={() => handleCheckboxContainerClick('thirdPartyDelivery')}
          >
            <input
              type="checkbox"
              id="thirdPartyDelivery"
              name="thirdPartyDelivery"
              checked={entryData.thirdPartyDelivery}
              onChange={handleChange}
              className="w-5 h-5"
              onClick={(e) => e.stopPropagation()}
            />
            <span
              className="ml-2 block text-base cursor-pointer"
              // htmlFor="thirdPartyDelivery"
              // onClick={(e) => {
              //   e.preventDefault();
              //   handleCheckboxContainerClick('thirdPartyDelivery');
              // }}
            >
              派送至三方
            </span>
          </div>

          <div
            className={`flex items-center p-3 rounded-lg border border-gray-200 shadow-sm ${entryData.customerInteraction ? 'bg-green-100' : 'bg-gray-50'} cursor-pointer`}
            onClick={() => handleCheckboxContainerClick('customerInteraction')}
          >
            <input
              type="checkbox"
              id="customerInteraction"
              name="customerInteraction"
              checked={entryData.customerInteraction}
              onChange={handleChange}
              className="w-5 h-5"
              onClick={(e) => e.stopPropagation()}
            />
            <span
              className="ml-2 block text-base cursor-pointer"
              // htmlFor="customerInteraction"
              // onClick={(e) => {
              //   e.preventDefault();
              //   handleCheckboxContainerClick('customerInteraction');
              // }}
            >
              客户有交互
            </span>
          </div>

          <div
            className={`flex items-center p-3 rounded-lg border border-gray-200 shadow-sm ${entryData.customerInteractionSending ? 'bg-green-100' : 'bg-gray-50'} cursor-pointer`}
            onClick={() => handleCheckboxContainerClick('customerInteractionSending')}
          >
            <input
              type="checkbox"
              id="customerInteractionSending"
              name="customerInteractionSending"
              checked={entryData.customerInteractionSending}
              onChange={handleChange}
              className="w-5 h-5"
              onClick={(e) => e.stopPropagation()}
            />
            <span
              className="ml-2 block text-base cursor-pointer"
              // htmlFor="customerInteractionSending"
              // onClick={(e) => {
              //   e.preventDefault();
              //   handleCheckboxContainerClick('customerInteractionSending');
              // }}
            >
              客户是否寄件
            </span>
          </div>

          <div
            className={`flex items-center p-3 rounded-lg border border-gray-200 shadow-sm ${entryData.customerInteractionReturn ? 'bg-green-100' : 'bg-gray-50'} cursor-pointer col-span-2`}
            onClick={() => handleCheckboxContainerClick('customerInteractionReturn')}
          >
            <input
              type="checkbox"
              id="customerInteractionReturn"
              name="customerInteractionReturn"
              checked={entryData.customerInteractionReturn}
              onChange={handleChange}
              className="w-5 h-5"
              onClick={(e) => e.stopPropagation()}
            />
            <span
              className="ml-2 block text-base cursor-pointer"
              // htmlFor="customerInteractionReturn"
              // onClick={(e) => {
              //   e.preventDefault();
              //   handleCheckboxContainerClick('customerInteractionReturn');
              // }}
            >
              如有电退是否有客户交互
            </span>
          </div>
        </div>

        <div>
          <label className="block text-gray-700 text-lg mb-1" htmlFor="notes">
            备注 (滞留 &quot;Z&quot;)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={entryData.notes}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg text-lg h-16"
            placeholder="输入备注信息"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-4 rounded-lg text-xl font-medium"
          >
            {isEditMode ? '保存修改' : '保存并继续'}
          </button>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleViewTable}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg text-lg"
          >
            查看表格
          </button>

          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-3 px-4 rounded-lg text-lg"
          >
            返回首页
          </button>
        </div>
      </form>
      <div className='text-sm text-gray-500 mt-8 flex flex-col gap-1'>
      <p>1、跟随小哥收派工作，逐票客观记录小哥末端作业真实情况，不允许干扰小哥正常工作流程及操作，避免影响真实性。</p>
      <p>2、 请与小哥提前知会：该记录数据仅用于内部标准优化数据支撑，运单统计结果匿名制，且不作为标准优化之外的公开或第三方使用（比如考核监控等）。</p>
      <p>3、其他说明：妥投地址“三方”：菜鸟驿站、超市、合作点、丰巢等</p>
      </div>
    </div>
  );
}
