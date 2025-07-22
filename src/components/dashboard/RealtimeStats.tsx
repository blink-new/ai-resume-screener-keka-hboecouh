import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  Activity, 
  TrendingUp, 
  Clock, 
  Zap,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface ProcessingJob {
  id: string
  fileName: string
  status: 'processing' | 'completed' | 'failed'
  progress: number
  startTime: Date
  estimatedCompletion?: Date
}

export function RealtimeStats() {
  const [currentJobs, setCurrentJobs] = useState<ProcessingJob[]>([])
  const [systemLoad, setSystemLoad] = useState(23)
  const [processingRate, setProcessingRate] = useState(4.2)
  const [queueSize, setQueueSize] = useState(0)

  // Simulate real-time processing
  useEffect(() => {
    const interval = setInterval(() => {
      // Update system metrics
      setSystemLoad(prev => Math.max(10, Math.min(90, prev + (Math.random() - 0.5) * 10)))
      setProcessingRate(prev => Math.max(1, Math.min(8, prev + (Math.random() - 0.5) * 0.5)))
      
      // Simulate new jobs occasionally
      if (Math.random() < 0.3 && currentJobs.length < 5) {
        const newJob: ProcessingJob = {
          id: `job-${Date.now()}`,
          fileName: `resume_${Math.floor(Math.random() * 1000)}.pdf`,
          status: 'processing',
          progress: 0,
          startTime: new Date(),
          estimatedCompletion: new Date(Date.now() + 5000 + Math.random() * 10000)
        }
        setCurrentJobs(prev => [...prev, newJob])
        setQueueSize(prev => prev + 1)
      }

      // Update job progress
      setCurrentJobs(prev => prev.map(job => {
        if (job.status === 'processing') {
          const newProgress = Math.min(100, job.progress + Math.random() * 25)
          if (newProgress >= 100) {
            setQueueSize(prev => Math.max(0, prev - 1))
            return {
              ...job,
              progress: 100,
              status: Math.random() > 0.1 ? 'completed' : 'failed'
            }
          }
          return { ...job, progress: newProgress }
        }
        return job
      }))

      // Remove completed jobs after a delay
      setCurrentJobs(prev => prev.filter(job => {
        if (job.status !== 'processing' && job.progress === 100) {
          const timeSinceCompletion = Date.now() - (job.estimatedCompletion?.getTime() || 0)
          return timeSinceCompletion < 3000 // Keep for 3 seconds after completion
        }
        return true
      }))
    }, 1000)

    return () => clearInterval(interval)
  }, [currentJobs.length])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  const getSystemLoadColor = (load: number) => {
    if (load < 30) return 'text-green-600'
    if (load < 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* System Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Load</p>
                <p className={`text-2xl font-bold ${getSystemLoadColor(systemLoad)}`}>
                  {systemLoad.toFixed(0)}%
                </p>
              </div>
              <Activity className={`h-6 w-6 ${getSystemLoadColor(systemLoad)}`} />
            </div>
            <Progress value={systemLoad} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {processingRate.toFixed(1)}/s
                </p>
              </div>
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex items-center mt-2">
              <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
              <span className="text-xs text-green-600">+12% vs avg</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Queue Size</p>
                <p className="text-2xl font-bold text-purple-600">{queueSize}</p>
              </div>
              <div className="flex items-center gap-1">
                <div className={`w-2 h-2 rounded-full ${
                  queueSize === 0 ? 'bg-green-500' : 
                  queueSize < 5 ? 'bg-yellow-500' : 'bg-red-500'
                }`} />
                <span className="text-xs text-gray-500">
                  {queueSize === 0 ? 'Idle' : queueSize < 5 ? 'Normal' : 'High'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Processing Jobs */}
      {currentJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" />
              Active Processing Jobs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(job.status)}
                    <div>
                      <p className="font-medium text-sm">{job.fileName}</p>
                      <p className="text-xs text-gray-500">
                        Started {job.startTime.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {job.status === 'processing' && (
                      <div className="w-24">
                        <Progress value={job.progress} className="h-2" />
                      </div>
                    )}
                    <Badge 
                      variant={
                        job.status === 'completed' ? 'default' :
                        job.status === 'failed' ? 'destructive' : 'secondary'
                      }
                    >
                      {job.status === 'processing' ? `${job.progress.toFixed(0)}%` : job.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { time: '2 min ago', action: 'Processed 25 resumes', type: 'success' },
              { time: '5 min ago', action: 'Exported 8 candidates to Keka', type: 'info' },
              { time: '12 min ago', action: 'Started batch processing (150 files)', type: 'processing' },
              { time: '18 min ago', action: 'Updated AI scoring criteria', type: 'update' },
              { time: '25 min ago', action: 'Completed quality check', type: 'success' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 py-2">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'success' ? 'bg-green-500' :
                  activity.type === 'info' ? 'bg-blue-500' :
                  activity.type === 'processing' ? 'bg-yellow-500' :
                  'bg-purple-500'
                }`} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.action}</p>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}