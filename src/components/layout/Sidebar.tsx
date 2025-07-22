import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { 
  LayoutDashboard, 
  Upload, 
  FileText, 
  Settings,
  BarChart3,
  Users,
  Briefcase
} from 'lucide-react'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
  { id: 'jobs', name: 'Job Requirements', icon: Briefcase },
  { id: 'upload', name: 'Upload Resumes', icon: Upload },
  { id: 'results', name: 'Screening Results', icon: FileText },
  { id: 'analytics', name: 'Analytics', icon: BarChart3 },
  { id: 'candidates', name: 'Candidates', icon: Users },
  { id: 'settings', name: 'Settings', icon: Settings },
]

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="flex h-full w-64 flex-col bg-gray-50 border-r">
      <div className="flex-1 flex flex-col pt-6 pb-4 overflow-y-auto">
        <nav className="mt-5 flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'ghost'}
                className={cn(
                  'w-full justify-start',
                  activeTab === item.id
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                )}
                onClick={() => onTabChange(item.id)}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}