'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { FormMetadata as FormMetadataType } from '../types';
import { saveForm, updateFormMetadata, getFormById } from '../utils/storage';

interface FormMetadataProps {
  formId?: string;
  onSave?: (formId: string) => void;
}

export default function FormMetadata({ formId, onSave }: FormMetadataProps) {
  const router = useRouter();
  const isNewForm = !formId || formId === 'new';

  const [formData, setFormData] = useState<Partial<FormMetadataType>>(() => {
    const today = format(new Date(), 'yyyy-MM-dd');
    if (isNewForm) {
      let defaults: Partial<FormMetadataType> = {};
      try {
        defaults = JSON.parse(localStorage.getItem('formDefaults') || '{}') as Partial<FormMetadataType>;
      } catch {}
      return {
        name: '',
        cityName: defaults.cityName || '',
        surveyDate: today,
        branchCode: defaults.branchCode || '',
        areaType: defaults.areaType || '',
        courierCode: defaults.courierCode || ''
      };
    }
    return {
      name: '',
      cityName: '',
      surveyDate: today,
      branchCode: '',
      areaType: '',
      courierCode: ''
    };
  });

  useEffect(() => {
    if (!isNewForm) {
      const existingForm = getFormById(formId);
      if (existingForm) {
        setFormData({
          name: existingForm.name,
          cityName: existingForm.cityName,
          surveyDate: existingForm.surveyDate,
          branchCode: existingForm.branchCode,
          areaType: existingForm.areaType,
          courierCode: existingForm.courierCode
        });
      }
    }
  }, [formId, isNewForm]);

  useEffect(() => {
    // Preload the table page for better UX
    router.prefetch('/');
    router.prefetch('/entry?formId=' + formId);
    router.prefetch('/table?formId=' + formId);
  }, [formId, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.branchCode) {
      alert('请填写表单名称和网点代码');
      return;
    }

    let savedFormId: string;
    
    if (isNewForm) {
      const newForm = saveForm(formData as Omit<FormMetadataType, 'id' | 'createdAt' | 'updatedAt'>);
      localStorage.setItem(
        'formDefaults',
        JSON.stringify({
          cityName: formData.cityName,
          branchCode: formData.branchCode,
          areaType: formData.areaType,
          courierCode: formData.courierCode
        })
      );
      savedFormId = newForm.id;
    } else {
      const updatedForm = updateFormMetadata(formId, formData);
      if (!updatedForm) {
        alert('更新表单失败');
        return;
      }
      savedFormId = updatedForm.id;
    }
    router.prefetch(`/entry?formId=${savedFormId}`);

    if (onSave) {
      onSave(savedFormId);
    } else {
      router.push(`/entry?formId=${savedFormId}`);
    }
  };

  return (
    <div className="min-h-[100dvh] p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">
        {isNewForm ? '创建新表单' : '编辑表单信息'}
      </h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 dark:text-gray-100 text-lg mb-2" htmlFor="name">
            表单名称
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg text-lg"
            placeholder="输入表单名称"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 dark:text-gray-100 text-lg mb-2" htmlFor="cityName">
            城市名
          </label>
          <input
            type="text"
            id="cityName"
            name="cityName"
            value={formData.cityName}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg text-lg"
            placeholder="城市名"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 dark:text-gray-100 text-lg mb-2" htmlFor="surveyDate">
            调研时间
          </label>
          <input
            type="date"
            id="surveyDate"
            name="surveyDate"
            value={formData.surveyDate}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg text-lg"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 dark:text-gray-100 text-lg mb-2" htmlFor="branchCode">
            网点代码
          </label>
          <input
            type="text"
            id="branchCode"
            name="branchCode"
            value={formData.branchCode}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg text-lg"
            placeholder="网点代码"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 dark:text-gray-100 text-lg mb-2" htmlFor="areaType">
            区域类型
          </label>
          <input
            type="text"
            id="areaType"
            name="areaType"
            value={formData.areaType}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg text-lg"
            placeholder="工业区/住宅区等"
          />
        </div>
        
        <div>
          <label className="block text-gray-700 dark:text-gray-100 text-lg mb-2" htmlFor="courierCode">
            小哥工号
          </label>
          <input
            type="text"
            inputMode="numeric"
            id="courierCode"
            name="courierCode"
            value={formData.courierCode}
            onChange={handleChange}
            className="w-full p-3 border border-gray-300 rounded-lg text-lg"
            placeholder="小哥工号"
          />
        </div>
        
        <div className="pt-4">
          <button
            type="submit"
            className="w-full bg-blue-500 dark:bg-blue-500/80 hover:bg-blue-600 text-white py-4 px-4 rounded-lg text-xl font-medium"
          >
            {isNewForm ? '创建表单' : '保存修改'}
          </button>
        </div>
        
        <div>
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full bg-gray-300 dark:bg-gray-300/90 hover:bg-gray-400 text-gray-800 py-3 px-4 rounded-lg text-lg"
          >
            返回
          </button>
        </div>
      </form>
    </div>
  );
}
