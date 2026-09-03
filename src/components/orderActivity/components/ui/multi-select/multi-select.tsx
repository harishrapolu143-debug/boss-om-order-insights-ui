import React, { useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Checkbox } from "./checkbox";

interface MultiSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string) => void;
  placeholder?: string;
  className?: string;
  contentWidth?: string;
  disabled?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  selected,
  onChange,
  placeholder = "Select items",
  className = "",
  contentWidth = "200px",
  disabled,
}) => {
  const [open, setOpen] = useState(false);

  const handleToggle = (value: string) => {
    // const newSelected = selected.includes(value)
    //   ? selected.filter((item) => item !== value)
    //   : [...selected, value];
    onChange(value);
  };

  const selectedOptions = options.filter((opt) => selected.includes(opt.value));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={`flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          disabled={disabled}
        >
          <span className="truncate flex items-center gap-1.5">
            {selected.length > 0 ? (
              <span className="flex items-center gap-1.5 flex-wrap">
                {selectedOptions.map((opt, index) => (
                  <span key={opt.value} className="flex items-center gap-1">
                    {opt.icon && (
                      <span className="text-gray-600 flex-shrink-0">
                        {opt.icon}
                      </span>
                    )}
                    <span>
                      {opt.label}
                      {index < selectedOptions.length - 1 && ","}
                    </span>
                  </span>
                ))}
              </span>
            ) : (
              placeholder
            )}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className={`w-[${contentWidth}] p-2 bg-white`}
        align="start"
      >
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-center space-x-2 px-2 py-1.5 rounded-md hover:bg-gray-100 cursor-pointer"
              onClick={() => handleToggle(option.value)}
            >
              <Checkbox
                id={option.value}
                checked={selected.includes(option.value)}
                onCheckedChange={() => handleToggle(option.value)}
                onClick={(e) => e.stopPropagation()}
                className="cursor-pointer"
              />
              <label
                htmlFor={option.value}
                onClick={() => handleToggle(option.value)}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1 flex items-center gap-2"
              >
                {option.icon && (
                  <span className="text-gray-600 flex-shrink-0">
                    {option.icon}
                  </span>
                )}
                {option.label}
              </label>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
