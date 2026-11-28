import React, { useCallback, useLayoutEffect, useRef, useState } from 'react';
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
  const [opensUp, setOpensUp] = useState(false);
  const [maxMenuHeight, setMaxMenuHeight] = useState(256);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedOption = options.find((option) => option.value === value);
  const menuHeight =
    Math.min(224, options.length * 40 + 8) + (onCreateNew ? 50 : 0);

  const updatePlacement = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const triggerRect = trigger.getBoundingClientRect();
    let boundaryTop = 0;
    let boundaryBottom = window.innerHeight;
    let ancestor = rootRef.current?.parentElement;

    while (ancestor && ancestor !== document.body) {
      const { overflowY } = window.getComputedStyle(ancestor);
      if (overflowY !== 'visible') {
        const rect = ancestor.getBoundingClientRect();
        boundaryTop = Math.max(boundaryTop, rect.top);
        boundaryBottom = Math.min(boundaryBottom, rect.bottom);
      }
      ancestor = ancestor.parentElement;
    }

    const spaceAbove = Math.max(0, triggerRect.top - boundaryTop - 8);
    const spaceBelow = Math.max(0, boundaryBottom - triggerRect.bottom - 8);
    const nextOpensUp = spaceBelow < menuHeight && spaceAbove > spaceBelow;
    const availableSpace = nextOpensUp ? spaceAbove : spaceBelow;
    const nextMaxHeight = Math.max(72, Math.min(menuHeight, availableSpace));

    setOpensUp(nextOpensUp);
    setMaxMenuHeight(nextMaxHeight);
  }, [menuHeight]);

  useLayoutEffect(() => {
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
      if (event.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    updatePlacement();
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', updatePlacement);
    window.addEventListener('scroll', updatePlacement, true);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', updatePlacement);
      window.removeEventListener('scroll', updatePlacement, true);
    };
  }, [isOpen, updatePlacement]);

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        ref={triggerRef}
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
        <div
          className={`absolute left-0 right-0 z-50 overflow-y-auto rounded-xl border border-black/[0.1] bg-white shadow-xl ${
            opensUp ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
          style={{ maxHeight: `${maxMenuHeight}px` }}
        >
          <div
            role="listbox"
            aria-label={`${ariaLabel} options`}
            className="overscroll-contain p-1"
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
