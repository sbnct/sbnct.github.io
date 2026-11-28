import React, { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, Plus } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  className: string;
  onCreateNew?: () => void;
  createNewLabel?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  value,
  options,
  onChange,
  ariaLabel,
  className,
  onCreateNew,
  createNewLabel = 'Create new',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        className={`w-full flex items-center justify-between gap-2 text-left ${className}`}
      >
        <span className="truncate">{selectedOption?.label || options[0]?.label}</span>
        <ChevronDown
          aria-hidden="true"
          className={`w-4 h-4 shrink-0 text-[#737373] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
          strokeWidth={1.75}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-black/[0.1] bg-white shadow-xl">
          <div
            role="listbox"
            aria-label={`${ariaLabel} options`}
            className="max-h-56 overflow-y-auto overscroll-contain p-1"
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`w-full min-h-[40px] px-3 py-2 rounded-lg flex items-center justify-between gap-2 text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-[#F5F5F7] font-medium text-[#0A0A0A]'
                      : 'text-[#525252] hover:bg-[#F5F5F7] hover:text-[#0A0A0A]'
                  }`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                </button>
              );
            })}
          </div>

          {onCreateNew && (
            <div className="border-t border-black/[0.06] p-1">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onCreateNew();
                }}
                className="w-full min-h-[40px] px-3 py-2 rounded-lg flex items-center gap-2 text-left text-xs font-medium text-[#0A0A0A] hover:bg-[#F5F5F7] transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{createNewLabel}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
