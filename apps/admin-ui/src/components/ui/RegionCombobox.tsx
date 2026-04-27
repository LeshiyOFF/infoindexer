"use client";

import * as React from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RegionOption {
  id: string;
  name: string;
}

interface RegionComboboxProps {
  value: string;
  onChange: (regionId: string) => void;
  options: RegionOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function RegionCombobox({
  value,
  onChange,
  options,
  placeholder = "Все регионы",
  disabled = false,
  className
}: RegionComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  const filteredOptions = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return options;
    return options.filter(
      (r) =>
        r.name.toLowerCase().includes(q) || r.id.toLowerCase().includes(q)
    );
  }, [options, search]);

  const selectedName = value
    ? options.find((r) => r.id === value)?.name ?? value
    : placeholder;

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => !disabled && setOpen(!open)}
        disabled={disabled}
        className={cn(
          "w-full h-10 px-3 py-2 rounded-xl border-2 border-gray-300 bg-gray-50 text-left text-sm font-bold",
          "focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500",
          "transition-all duration-200 hover:border-gray-400",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "flex items-center justify-between gap-2"
        )}
      >
        <span className={cn("truncate", !value && "text-gray-500")}>
          {selectedName}
        </span>
        <ChevronDown
          className={cn("w-4 h-4 shrink-0 text-gray-500 transition-transform", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          className={cn(
            "absolute top-full left-0 right-0 mt-1 z-50",
            "bg-white rounded-xl border-2 border-gray-200 shadow-lg",
            "overflow-hidden max-h-64 flex flex-col"
          )}
        >
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск региона..."
                className={cn(
                  "w-full pl-9 pr-3 py-2 rounded-lg border-2 border-gray-200",
                  "text-sm font-medium focus:outline-none focus:ring-2 focus:ring-gray-500/20 focus:border-gray-500"
                )}
                autoFocus
              />
            </div>
          </div>
          <div className="overflow-auto flex-1 min-h-0">
            <button
              type="button"
              onClick={() => handleSelect("")}
              className={cn(
                "w-full px-3 py-2.5 text-left text-sm font-bold",
                "hover:bg-gray-100 transition-colors",
                !value && "bg-gray-50 text-gray-800"
              )}
            >
              {placeholder}
            </button>
            {filteredOptions.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleSelect(r.id)}
                className={cn(
                  "w-full px-3 py-2.5 text-left text-sm font-bold truncate",
                  "hover:bg-gray-100 transition-colors",
                  value === r.id && "bg-gray-50 text-gray-800"
                )}
              >
                {r.name}
              </button>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">
                Ничего не найдено
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
