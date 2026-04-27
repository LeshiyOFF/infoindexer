import { AuthProvider } from "@/components/AuthProvider";
import { BatchProvider } from "@/contexts/BatchContext";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardMain } from "@/components/DashboardMain";
import { DashboardErrorBoundary } from "@/components/DashboardErrorBoundary";

export default function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <BatchProvider>
        <DashboardErrorBoundary>
          <div className="min-h-screen bg-gray-50 flex flex-col text-gray-900">
            <DashboardHeader />
            <DashboardMain>{children}</DashboardMain>
          </div>
        </DashboardErrorBoundary>
      </BatchProvider>
    </AuthProvider>
  );
}
