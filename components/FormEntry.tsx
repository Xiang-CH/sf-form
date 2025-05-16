'use client';

import { useState, useEffect, use } from 'react';
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
  // isEditMode is not compatible with adding multiple entries at once
  // const [isEditMode] = useState(!!entryId);

  // State for individual tracking number input
  const [currentTrackingNumberInput, setCurrentTrackingNumberInput] = useState('');
  // State for list of tracking numbers to be added
  const [trackingNumbersToAdd, setTrackingNumbersToAdd] = useState<string[]>([]);

  // State for metadata common to all entries being added
  const [metadata, setMetadata] = useState<Omit<FormEntryType, 'id' | 'createdAt' | 'trackingNumberLastFour'>>({
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
        const { trackingNumberLastFour, ...entryDataWithoutId } = entry;
        setMetadata(entryDataWithoutId);
        setCurrentTrackingNumberInput(trackingNumberLastFour); // Load tracking number into input
        setTrackingNumbersToAdd([]); // Clear tags in edit mode
      } else {
        showToast('找不到条目', 'error');
        router.push(`/table?formId=${formId}`);
      }
    }
  }, [entryId, formId, router, showToast]);

  useEffect(() => {
    // Preload the table page for better UX
    router.prefetch('/');
    router.prefetch('/form');
    router.prefetch(`/table?formId=${formId}`);
  }, [formId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setMetadata(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'trackingNumberLastFour') {
      // Only allow digits and letters for tracking number
      const alphanumericOnly = value.replace(/[^0-9]/g, '');
      setCurrentTrackingNumberInput(alphanumericOnly);
      console.log(alphanumericOnly)
      // Automatically add when 4 characters are entered (only in add mode)
      if (!entryId) {
        handleAddTrackingNumber(alphanumericOnly);
      }
    } else {
      setMetadata(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddTrackingNumber = (trackingNumber: string) => {
    const trimmedInput = trackingNumber.trim();
    // Only add if it's exactly 4 characters and not already in the list
    if (trimmedInput && trimmedInput.length === 4) {
      setTrackingNumbersToAdd(prev => [...prev, trimmedInput]);
      setCurrentTrackingNumberInput(''); // Clear input after adding
    } else if (trimmedInput.length > 0 && trimmedInput.length < 4) {
        // Optionally show a message if less than 4 characters on blur/submit if needed, but for auto-add, this is fine.
    }
  };

  const handleRemoveTrackingNumber = (numberToRemove: string) => {
    setTrackingNumbersToAdd(prev => prev.filter(number => number !== numberToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // If in edit mode, handle single entry update
    if (entryId) {
      if (!currentTrackingNumberInput) {
        showToast('请填写运单号后四位', 'error');
        return;
      }

      if (currentTrackingNumberInput.length !== 4) {
        showToast('运单号后四位必须是4个字符', 'error');
        return;
      }

      const updatedEntry = updateFormEntry(formId, entryId, { ...metadata, trackingNumberLastFour: currentTrackingNumberInput });

      if (updatedEntry) {
        showToast('条目已更新', 'success');
        router.push(`/table?formId=${formId}`);
      } else {
        showToast('更新条目失败', 'error');
      }
      return; // Exit function after handling edit mode
    }

    // If not in edit mode, handle adding one or multiple entries
    const entriesToSave = [...trackingNumbersToAdd];

    // If there are no tags, check if the current input is a valid single entry
    if (entriesToSave.length === 0 && currentTrackingNumberInput.length === 4) {
        entriesToSave.push(currentTrackingNumberInput.trim());
    }

    if (entriesToSave.length === 0) {
       showToast('请填写一个或多个运单号后四位', 'error');
       return;
    }

    let successfullyAddedCount = 0;

    entriesToSave.forEach(trackingNumber => {
        if (trackingNumber.length === 4) { // Ensure each number is 4 digits/letters
            const newEntry = addFormEntry(formId, { ...metadata, trackingNumberLastFour: trackingNumber }, successfullyAddedCount);
            if (newEntry) {
                successfullyAddedCount++;
            }
        }
    });

    if (successfullyAddedCount > 0) {
        // Clear form for next entry/batch
        setMetadata({
          addressDelivered: false,
          thirdPartyDelivery: false,
          customerInteraction: false,
          customerInteractionSending: false,
          customerInteractionReturn: false,
          notes: ''
        });
        setCurrentTrackingNumberInput('');
        

        // Update the displayed count based on how many were actually added
        setCurrentEntryCount(prev => prev + successfullyAddedCount);

        // Show success message
        showToast(`成功保存 ${successfullyAddedCount} 个条目！\n`+ trackingNumbersToAdd.join(", "), 'success');
        setTrackingNumbersToAdd([]); // Clear the list of tags

        setIsSwiping(true);
        setTimeout(() => {
          setIsSwiping(false);
        }, 300);
    } else {
        showToast('保存条目失败', 'error');
    }
  };

  const handleViewTable = () => {
    router.push(`/table?formId=${formId}`);
  };

  return (
    <div className={`p-4 pt-6 max-w-md mx-auto pb-2 animate-fade-in-left ${isSwiping ? 'swipe-left-animation' : ''}`}>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{entryId ? '编辑条目' : '添加条目'}</h1>
        {!entryId && (
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
            inputMode="numeric"
            pattern="[0-9]{4}"
            id="trackingNumberLastFour"
            name="trackingNumberLastFour"
            value={currentTrackingNumberInput}
            onChange={handleChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-xl"
            placeholder="输入一个或多个运单号后四位"
            maxLength={4}
            // required
          />
          {/* Display tracking numbers as tags */}
          {!entryId && trackingNumbersToAdd.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {trackingNumbersToAdd.map((number, index) => (
                <div
                  key={index}
                  className="flex items-center bg-green-200 text-green-800 text-md font-medium px-3 py-2 rounded-full"
                >
                  {number}
                  <button
                    type="button"
                    onClick={() => handleRemoveTrackingNumber(number)}
                    className="ml-2 -mr-1 bg-transparent text-green-800 hover:text-green-900 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                    aria-label="Remove tracking number"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {/* First column */}
          <SelectableCheckbox
            label="订单妥投"
            name="addressDelivered"
            checked={metadata.addressDelivered}
            onChange={handleChange}
          />

          <SelectableCheckbox
            label="派送至三方"
            name="thirdPartyDelivery"
            checked={metadata.thirdPartyDelivery}
            onChange={handleChange}
          />

          <SelectableCheckbox
            label="客户有交互"
            name="customerInteraction"
            checked={metadata.customerInteraction}
            onChange={handleChange}
          />

          <SelectableCheckbox
            label="客户是否寄件"
            name="customerInteractionSending"
            checked={metadata.customerInteractionSending}
            onChange={handleChange}
          />
        </div>
        <SelectableCheckbox
            label="如有电退是否有客户交互"
            name="customerInteractionReturn"
            checked={metadata.customerInteractionReturn}
            onChange={handleChange}
          />

        <div>
          <label className="block text-gray-700 dark:text-gray-50 text-lg mb-1" htmlFor="notes">
            备注 (滞留 &quot;Z&quot;)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={metadata.notes}
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
            {entryId ? '保存修改' : '保存并继续'}
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
