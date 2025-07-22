import { useState, useEffect } from 'react'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Users, 
  FileText, 
  Clock,
  ArrowRight,
  Brain
} from 'lucide-react'
import { blink } from '@/blink/client'

interface DashboardProps {
  onNavigate?: (tab: string) => void
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    totalResumes: 0,
    processedResumes: 0,
    qualifiedCandidates: 0,
    processingTime: '2.3s'
  })
  const [topSkills, setTopSkills] = useState<Array<{skill: string, count: number, percentage: number}>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true)
        
        // Load resumes data
        const resumes = await blink.db.resumes.list()
        
        // Calculate stats
        const totalResumes = resumes.length
        const processedResumes = resumes.filter(r => r.processedAt).length
        const qualifiedCandidates = resumes.filter(r => (r.relevanceScore || 0) >= 0.8).length
        
        setStats({
          totalResumes,
          processedResumes,
          qualifiedCandidates,
          processingTime: '2.3s'
        })
        
        // Calculate top skills
        const skillCounts = new Map<string, number>()
        resumes.forEach(resume => {
          if (resume.skills) {
            const skills = JSON.parse(resume.skills)
            skills.forEach((skill: string) => {
              skillCounts.set(skill, (skillCounts.get(skill) || 0) + 1)
            })
          }
        })
        
        const sortedSkills = Array.from(skillCounts.entries())
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([skill, count]) => ({
            skill,
            count,
            percentage: Math.round((count / totalResumes) * 100)
          }))
        
        setTopSkills(sortedSkills)
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadDashboardData()
  }, [])

  const recentActivity = [
    { action: 'Processed 150 resumes', time: '2 minutes ago', type: 'success' },
    { action: 'Exported 25 candidates to Keka', time: '15 minutes ago', type: 'info' },
    { action: 'Started batch processing', time: '1 hour ago', type: 'processing' },
    { action: 'Updated screening criteria', time: '3 hours ago', type: 'update' }
  ]



  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          AI-powered resume screening with Keka integration
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Processing Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                AI Processing Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Batch Progress</span>
                  <span className="text-sm text-gray-500">93% complete</span>
                </div>
                <Progress value={93} className="w-full" />
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">2.3s</div>
                    <div className="text-sm text-gray-600">Avg. Processing Time</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">94.2%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Skills */}
          <Card>
            <CardHeader>
              <CardTitle>Top Skills in Candidate Pool</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topSkills.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <span className="font-medium">{item.skill}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24">
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                      <span className="text-sm text-gray-500 w-12">{item.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                className="w-full justify-between" 
                variant="outline"
                onClick={() => onNavigate?.('upload')}
              >
                Upload New Resumes
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                className="w-full justify-between" 
                variant="outline"
                onClick={() => onNavigate?.('results')}
              >
                View All Results
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                className="w-full justify-between" 
                variant="outline"
                onClick={() => {
                  // In real app, this would export qualified candidates
                  alert('Exporting qualified candidates to Keka ATS...')
                }}
              >
                Export to Keka
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                className="w-full justify-between" 
                variant="outline"
                onClick={() => onNavigate?.('settings')}
              >
                Configure Settings
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'success' ? 'bg-green-500' :
                      activity.type === 'info' ? 'bg-blue-500' :
                      activity.type === 'processing' ? 'bg-yellow-500' :
                      'bg-gray-500'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action}
                      </p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">AI Processing</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Keka Integration</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-green-600">Connected</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm text-green-600">Healthy</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}