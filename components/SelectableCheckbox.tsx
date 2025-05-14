import React from 'react';

interface SelectableCheckboxProps {
  label: string;
  name: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  colSpan?: number;
}

const SelectableCheckbox: React.FC<SelectableCheckboxProps> = ({
  label,
  name,
  checked,
  onChange,
  className = '',
  colSpan
}) => {
  const handleContainerClick = () => {
    // Programmatically trigger the checkbox change event
    const checkbox = document.getElementById(name) as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = !checked;
      // Create a new event to pass to the onChange handler
      const event = new Event('change', { bubbles: true });
      Object.defineProperty(event, 'target', { writable: false, value: checkbox });
      onChange(event as unknown as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div
      className={`flex items-center p-3 rounded-lg shadow-sm cursor-pointer ${
        checked ? 'bg-green-100 dark:bg-green-300/40' : 'bg-gray-50 dark:bg-[var(--card)]'
      } ${className} ${colSpan ? `col-span-${colSpan}` : ''}`}
      onClick={handleContainerClick}
    >
      <input
        type="checkbox"
        id={name}
        name={name}
        checked={checked}
        onChange={onChange}
        className="w-5 h-5"
        // Prevent the container click from triggering this handler twice
        onClick={(e) => e.stopPropagation()}
      />
      <span className="ml-2 block text-base cursor-pointer">
        {label}
      </span>
    </div>
  );
};

export default SelectableCheckbox; 