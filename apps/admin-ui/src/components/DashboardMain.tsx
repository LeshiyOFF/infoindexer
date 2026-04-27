"use client";

export function DashboardMain({
  children,
}: { children: React.ReactNode }) {
  return (
    <main className="flex-1 overflow-auto overflow-x-hidden p-4 sm:p-8 relative">
      <div className="max-w-7xl mx-auto pb-12">{children}</div>
    </main>
  );
}
