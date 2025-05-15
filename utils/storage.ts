import { Form, FormEntry, FormMetadata } from '../types';

const FORMS_STORAGE_KEY = 'sf-forms';

// Get all forms from local storage
export const getForms = (): Form[] => {
  if (typeof window === 'undefined') return [];

  const storedForms = localStorage.getItem(FORMS_STORAGE_KEY);
  if (!storedForms) return [];

  try {
    return JSON.parse(storedForms);
  } catch (error) {
    console.error('Error parsing forms from local storage:', error);
    return [];
  }
};

// Get a specific form by ID
export const getFormById = (formId: string): Form | null => {
  const forms = getForms();
  return forms.find(form => form.id === formId) || null;
};

// Save a new form
export const saveForm = (formMetadata: Omit<FormMetadata, 'id' | 'createdAt' | 'updatedAt'>): Form => {
  const forms = getForms();
  const now = new Date().toISOString();

  const newForm: Form = {
    ...formMetadata,
    id: `form-${Date.now()}`,
    createdAt: now,
    updatedAt: now,
    entries: []
  };

  localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify([...forms, newForm]));
  return newForm;
};

// Update an existing form's metadata
export const updateFormMetadata = (formId: string, metadata: Partial<FormMetadata>): Form | null => {
  const forms = getForms();
  const formIndex = forms.findIndex(form => form.id === formId);

  if (formIndex === -1) return null;

  const updatedForm = {
    ...forms[formIndex],
    ...metadata,
    updatedAt: new Date().toISOString()
  };

  forms[formIndex] = updatedForm;
  localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(forms));

  return updatedForm;
};

// Add a new entry to a form
export const addFormEntry = (formId: string, entry: Omit<FormEntry, 'id' | 'createdAt'>, iterations?: number): FormEntry | null => {
  const forms = getForms();
  const formIndex = forms.findIndex(form => form.id === formId);

  if (formIndex === -1) return null;

  const newEntry: FormEntry = {
    ...entry,
    id: `entry-${Date.now() + (iterations || 0)}`,
    createdAt: new Date().toISOString()
  };

  forms[formIndex].entries.push(newEntry);
  forms[formIndex].updatedAt = new Date().toISOString();

  localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(forms));

  return newEntry;
};

// Delete a form
export const deleteForm = (formId: string): boolean => {
  const forms = getForms();
  const updatedForms = forms.filter(form => form.id !== formId);

  if (updatedForms.length === forms.length) return false;

  localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(updatedForms));
  return true;
};

// Delete an entry from a form
export const deleteFormEntry = (formId: string, entryId: string): boolean => {
  const forms = getForms();
  const formIndex = forms.findIndex(form => form.id === formId);

  if (formIndex === -1) return false;

  const updatedEntries = forms[formIndex].entries.filter(entry => entry.id !== entryId);

  if (updatedEntries.length === forms[formIndex].entries.length) return false;

  forms[formIndex].entries = updatedEntries;
  forms[formIndex].updatedAt = new Date().toISOString();

  localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(forms));
  return true;
};

// Get a specific entry by ID
export const getFormEntryById = (formId: string, entryId: string): FormEntry | null => {
  const form = getFormById(formId);
  if (!form) return null;

  return form.entries.find(entry => entry.id === entryId) || null;
};

// Update an existing entry
export const updateFormEntry = (formId: string, entryId: string, updatedData: Omit<FormEntry, 'id' | 'createdAt'>): FormEntry | null => {
  const forms = getForms();
  const formIndex = forms.findIndex(form => form.id === formId);

  if (formIndex === -1) return null;

  const entryIndex = forms[formIndex].entries.findIndex(entry => entry.id === entryId);

  if (entryIndex === -1) return null;

  const updatedEntry = {
    ...forms[formIndex].entries[entryIndex],
    ...updatedData,
  };

  forms[formIndex].entries[entryIndex] = updatedEntry;
  forms[formIndex].updatedAt = new Date().toISOString();

  localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(forms));

  return updatedEntry;
};
