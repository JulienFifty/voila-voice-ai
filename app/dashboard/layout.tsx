import Sidebar from '@/components/Sidebar'
import { DashboardIndustryProvider } from '@/contexts/DashboardIndustryContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardIndustryProvider>
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </DashboardIndustryProvider>
  )
}
