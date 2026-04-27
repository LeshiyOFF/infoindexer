"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Settings, Layers, Menu, X } from "lucide-react";
import { BatchNavButton } from "@/components/BatchNavButton";
import { useBatch } from "@/contexts/BatchContext";

const navLinks = [
  { href: "/organizations", icon: Building2, label: "Организации" },
  { href: "/settings", icon: Settings, label: "Настройки" },
];

export function DashboardHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const { batchItems, batchProcessing, batchProgress, currentBatchId } =
    useBatch();

  const completedCount =
    currentBatchId && batchProcessing
      ? batchItems.filter(b => {
          const p = batchProgress[b.inn];
          return p && (p.status === "completed" || p.status === "error");
        }).length
      : 0;
  const totalCount = batchItems.length;
  const progressPct =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="h-14 sticky top-0 z-20 bg-white border-b border-gray-200 flex items-center px-4 sm:px-6 shrink-0">
        <Link
          href="/"
          className="flex items-center hover:opacity-80 transition-opacity mr-4 sm:mr-8 shrink-0"
          onClick={closeMenu}
        >
          <span className="text-lg font-bold text-black tracking-tight">
            LBS
          </span>
        </Link>

        {/* Десктопная навигация */}
        <nav className="hidden lg:flex items-center gap-1 flex-1">
          {navLinks.map(({ href, icon: Icon, label }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100 hover:text-black transition-colors font-medium text-sm"
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
          <BatchNavButton />
        </nav>

        {/* Мобильная кнопка меню и бейдж очереди (цель для анимации плюсика) */}
        <div className="lg:hidden flex items-center gap-2 ml-auto">
          {batchItems.length > 0 && (
            <Link
              href="/batches"
              className="batch-nav-badge-target flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full bg-gray-800 text-white text-xs font-bold"
              aria-label={`В очереди: ${batchItems.length}`}
            >
              {batchItems.length}
            </Link>
          )}
          <button
            onClick={() => setMenuOpen(true)}
            className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-700 hover:bg-gray-100 hover:text-black transition-all duration-200"
            aria-label="Открыть меню"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Мобильное выдвижное меню */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <div
            className="fixed right-0 top-0 bottom-0 w-[min(280px,85vw)] z-50 lg:hidden bg-white border-l border-gray-200 shadow-xl flex flex-col"
            role="dialog"
            aria-label="Навигация"
          >
            <div className="p-4 flex items-center justify-between border-b border-gray-200 shrink-0">
              <span className="text-lg font-bold text-black">Меню</span>
              <button
                onClick={closeMenu}
                className="flex items-center justify-center w-10 h-10 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all duration-200"
                aria-label="Закрыть меню"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex flex-col p-4 gap-1 overflow-auto">
              {navLinks.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={closeMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
                    pathname.startsWith(href)
                      ? "bg-gray-900 text-white"
                      : "text-gray-700 hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {label}
                </Link>
              ))}
              <Link
                href="/batches"
                onClick={closeMenu}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-medium text-sm transition-all duration-200 ${
                  pathname.startsWith("/batches")
                    ? "bg-gray-900 text-white"
                    : "text-gray-700 hover:bg-gray-100 hover:text-black"
                }`}
              >
                <Layers className="w-5 h-5 shrink-0" />
                <span className="flex-1">Очередь обработки контактов</span>
                {batchItems.length > 0 && (
                  <span className="batch-nav-badge-target flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full bg-gray-800 text-white text-xs font-bold">
                    {batchItems.length}
                  </span>
                )}
                {batchProcessing && totalCount > 0 && (
                  <div className="h-2 w-12 rounded-full bg-gray-200 overflow-hidden shrink-0">
                    <div
                      className="h-full bg-gray-800 transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                )}
              </Link>
            </nav>
          </div>
        </>
      )}
    </>
  );
}
