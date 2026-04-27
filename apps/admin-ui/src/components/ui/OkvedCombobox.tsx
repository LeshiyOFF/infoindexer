"use client";

import * as React from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAuthHeaders } from "@/lib/api";
import { OKVED_OPTIONS, getOkvedName } from "@/lib/okved";

interface OkvedOption {
  code: string;
  name?: string;
}

interface OkvedComboboxProps {
  value: string;
  onChange: (code: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/** Объединяет коды из API с полным справочником OKVED_CLASSES (код + наименование). Буквенные разделы A–U исключаются — по ним нет результатов. */
function mergeOkvedOptions(apiCodes: { code: string }[]): OkvedOption[] {
  const staticMap = new Map(OKVED_OPTIONS.map((o) => [o.code, o.name]));
  const codeSet = new Set<string>();
  const result: OkvedOption[] = [];
  for (const o of OKVED_OPTIONS) {
    codeSet.add(o.code);
    result.push({ code: o.code, name: o.name });
  }
  for (const c of apiCodes) {
    if (!codeSet.has(c.code)) {
      // Пропустить буквенные разделы A–U: в БД только числовые коды, по ним нет результатов
      if (/^[A-U]$/.test(c.code)) continue;
      codeSet.add(c.code);
      result.push({ code: c.code, name: staticMap.get(c.code) });
    }
  }
  result.sort((a, b) => a.code.localeCompare(b.code));
  return result;
}

export function OkvedCombobox({
  value,
  onChange,
  placeholder = "Все виды деятельности",
  disabled = false,
  className
}: OkvedComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [options, setOptions] = React.useState<OkvedOption[]>(() =>
    OKVED_OPTIONS.map((o) => ({ code: o.code, name: o.name }))
  );
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/organizations/okved-list", { headers: getAuthHeaders() })
      .then((res) => res.json())
      .then((json: { data?: { code: string }[]; error?: string }) => {
        if (cancelled) return;
        const codes = json.data ?? [];
        setOptions(mergeOkvedOptions(codes));
      })
      .catch(() => {
        if (!cancelled) setOptions(OKVED_OPTIONS.map((o) => ({ code: o.code, name: o.name })));
      });
    return () => { cancelled = true; };
  }, []);

  const filteredOptions = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = q
      ? options.filter(
          (o) =>
            o.code.toLowerCase().includes(q) ||
            (o.name ?? "").toLowerCase().includes(q)
        )
      : options;
    // Всегда включать текущее значение, если оно не в списке (напр. ОКВЭД карточки компании)
    if (value && !list.some((o) => o.code === value)) {
      list = [{ code: value, name: undefined }, ...list];
    }
    return list;
  }, [search, options, value]);

  const selectedOption = value ? options.find((o) => o.code === value) : null;
  const resolvedName = selectedOption?.name ?? (value ? getOkvedName(value) : undefined);
  /** Отображение: "код - название". Тултип при наведении — полное название. */
  const selectedLabel = value
    ? (resolvedName ? `${selectedOption?.code ?? value} - ${resolvedName}` : (selectedOption?.code ?? value))
    : placeholder;
  const tooltipText = resolvedName ?? selectedLabel;

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    onChange(code);
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
        <span className={cn("truncate", !value && "text-gray-500")} title={tooltipText}>
          {selectedLabel}
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
                placeholder="Поиск по коду или названию..."
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
            {filteredOptions.map((o) => (
              <button
                key={o.code}
                type="button"
                onClick={() => handleSelect(o.code)}
                className={cn(
                  "w-full px-3 py-2.5 text-left text-sm truncate",
                  "hover:bg-gray-100 transition-colors",
                  value === o.code && "bg-gray-50 text-gray-800",
                  "flex flex-col items-start gap-0.5"
                )}
              >
                <span className="font-mono font-bold text-gray-800">{o.code}</span>
                {o.name && <span className="text-xs text-gray-600 truncate w-full">{o.name}</span>}
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
