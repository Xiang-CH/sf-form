'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FormEntry as FormEntryType } from '../types';
import { addFormEntry, getFormById, getFormEntryById, updateFormEntry } from '../utils/storage';
import { useToast } from './Toast';
import SelectableCheckbox from './SelectableCheckbox';

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

  const [isSwiping, setIsSwiping] = useState(false);

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
        setIsSwiping(true);
        setTimeout(() => {
          router.push(`/table?formId=${formId}`);
          setIsSwiping(false);
        }, 500);
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

        setIsSwiping(true);
        setTimeout(() => {
          setIsSwiping(false);
        }, 300);
      } else {
        showToast('保存条目失败', 'error');
      }
    }
  };

  const handleViewTable = () => {
    router.push(`/table?formId=${formId}`);
  };

  return (
    <div className={`p-4 pt-6 max-w-md mx-auto pb-2 animate-fade-in-left ${isSwiping ? 'swipe-left-animation' : ''}`}>

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

        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* First column */}
          <SelectableCheckbox
            label="订单妥投"
            name="addressDelivered"
            checked={entryData.addressDelivered}
            onChange={handleChange}
          />

          <SelectableCheckbox
            label="派送至三方"
            name="thirdPartyDelivery"
            checked={entryData.thirdPartyDelivery}
            onChange={handleChange}
          />

          <SelectableCheckbox
            label="客户有交互"
            name="customerInteraction"
            checked={entryData.customerInteraction}
            onChange={handleChange}
          />

          <SelectableCheckbox
            label="客户是否寄件"
            name="customerInteractionSending"
            checked={entryData.customerInteractionSending}
            onChange={handleChange}
          />
        </div>
        <SelectableCheckbox
            label="如有电退是否有客户交互"
            name="customerInteractionReturn"
            checked={entryData.customerInteractionReturn}
            onChange={handleChange}
          />

        <div>
          <label className="block text-gray-700 dark:text-gray-50 text-lg mb-1" htmlFor="notes">
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
            className="w-full bg-green-500 hover:bg-green-600 dark:bg-green-400/80 dark:hover:bg-green-600/90 text-white py-4 px-4 rounded-lg text-xl font-medium"
          >
            {isEditMode ? '保存修改' : '保存并继续'}
          </button>
        </div>

        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleViewTable}
            className="flex-1 bg-blue-500 dark:bg-blue-500/90 hover:bg-blue-600 dark:hover:bg-blue-600/90 text-white py-3 px-4 rounded-lg text-lg"
          >
            查看表格
          </button>

          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex-1 bg-gray-300 dark:bg-gray-300/95  hover:bg-gray-400 dark:hover:bg-gray-100/90 text-gray-800 py-3 px-4 rounded-lg text-lg"
          >
            返回首页
          </button>
        </div>
      </form>
    </div>
  );
}
