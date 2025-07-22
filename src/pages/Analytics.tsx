import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  FileText, 
  Clock,
  Target,
  Award,
  BarChart3,
  PieChart,
  Calendar,
  Download
} from 'lucide-react'

export function Analytics() {
  const [timeRange, setTimeRange] = useState('7d')

  const metrics = {
    totalProcessed: 12847,
    qualifiedCandidates: 3892,
    averageScore: 76.4,
    processingTime: 2.1,
    successRate: 94.2,
    exportedToKeka: 1247
  }

  const trends = {
    processed: { value: 23, isPositive: true },
    qualified: { value: 18, isPositive: true },
    score: { value: 5.2, isPositive: true },
    time: { value: 12, isPositive: false }
  }

  const skillsAnalysis = [
    { skill: 'JavaScript', demand: 89, supply: 67, gap: 22 },
    { skill: 'Python', demand: 82, supply: 71, gap: 11 },
    { skill: 'React', demand: 78, supply: 59, gap: 19 },
    { skill: 'AWS', demand: 75, supply: 43, gap: 32 },
    { skill: 'Node.js', demand: 71, supply: 52, gap: 19 },
    { skill: 'Docker', demand: 68, supply: 38, gap: 30 },
    { skill: 'Kubernetes', demand: 65, supply: 29, gap: 36 },
    { skill: 'TypeScript', demand: 62, supply: 45, gap: 17 }
  ]

  const processingStats = [
    { date: '2024-01-14', processed: 234, qualified: 89, exported: 67 },
    { date: '2024-01-15', processed: 189, qualified: 72, exported: 54 },
    { date: '2024-01-16', processed: 312, qualified: 118, exported: 89 },
    { date: '2024-01-17', processed: 267, qualified: 95, exported: 71 },
    { date: '2024-01-18', processed: 298, qualified: 112, exported: 84 },
    { date: '2024-01-19', processed: 345, qualified: 134, exported: 98 },
    { date: '2024-01-20', processed: 278, qualified: 106, exported: 79 }
  ]

  const scoreDistribution = [
    { range: '90-100', count: 892, percentage: 23 },
    { range: '80-89', count: 1456, percentage: 38 },
    { range: '70-79', count: 1123, percentage: 29 },
    { range: '60-69', count: 298, percentage: 8 },
    { range: '50-59', count: 78, percentage: 2 }
  ]

  const departmentBreakdown = [
    { department: 'Engineering', candidates: 2847, qualified: 1234, rate: 43.3 },
    { department: 'Product', candidates: 892, qualified: 456, rate: 51.1 },
    { department: 'Design', candidates: 567, qualified: 234, rate: 41.3 },
    { department: 'Marketing', candidates: 445, qualified: 189, rate: 42.5 },
    { department: 'Sales', candidates: 334, qualified: 167, rate: 50.0 }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights into your resume screening performance
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['7d', '30d', '90d'].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="text-xs"
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </Button>
            ))}
          </div>
          
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Processed</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalProcessed.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+{trends.processed.value}%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Qualified Candidates</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.qualifiedCandidates.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+{trends.qualified.value}%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.averageScore}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+{trends.score.value}%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Award className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Processing Time</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.processingTime}s</p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">-{trends.time.value}%</span>
                  <span className="text-sm text-gray-500 ml-1">faster</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.successRate}%</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+2.1%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Exported to Keka</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.exportedToKeka.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-sm text-green-600">+15%</span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analysis */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Skills Gap Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Skills Gap Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {skillsAnalysis.map((skill, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{skill.skill}</span>
                    <Badge variant={skill.gap > 25 ? 'destructive' : skill.gap > 15 ? 'secondary' : 'default'}>
                      {skill.gap}% gap
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Demand: {skill.demand}%</span>
                      <span>Supply: {skill.supply}%</span>
                    </div>
                    <div className="relative">
                      <Progress value={skill.demand} className="h-2" />
                      <Progress 
                        value={skill.supply} 
                        className="h-2 absolute top-0 opacity-60" 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-green-600" />
              Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {scoreDistribution.map((range, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${
                      index === 0 ? 'bg-green-500' :
                      index === 1 ? 'bg-blue-500' :
                      index === 2 ? 'bg-yellow-500' :
                      index === 3 ? 'bg-orange-500' : 'bg-red-500'
                    }`} />
                    <span className="font-medium">{range.range}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-32">
                      <Progress value={range.percentage} className="h-2" />
                    </div>
                    <span className="text-sm text-gray-600 w-16">{range.count}</span>
                    <span className="text-sm text-gray-500 w-12">{range.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Processing Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Processing Trends (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {processingStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">
                      {new Date(stat.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-blue-600">{stat.processed}</div>
                      <div className="text-gray-500">Processed</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-green-600">{stat.qualified}</div>
                      <div className="text-gray-500">Qualified</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-purple-600">{stat.exported}</div>
                      <div className="text-gray-500">Exported</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Department Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-orange-600" />
              Department Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departmentBreakdown.map((dept, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{dept.department}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {dept.qualified}/{dept.candidates}
                      </span>
                      <Badge variant={dept.rate > 45 ? 'default' : 'secondary'}>
                        {dept.rate}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={dept.rate} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights and Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>AI Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">🎯 Skill Gap Alert</h4>
              <p className="text-sm text-blue-800">
                High demand for Kubernetes and AWS skills with low candidate supply. 
                Consider expanding search criteria or offering training programs.
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">📈 Performance Boost</h4>
              <p className="text-sm text-green-800">
                Processing efficiency improved by 12% this week. The AI model is 
                getting better at identifying qualified candidates.
              </p>
            </div>
            
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">⚡ Quick Win</h4>
              <p className="text-sm text-yellow-800">
                892 high-scoring candidates (90+) are ready for immediate export to Keka. 
                This could fill 15-20 open positions.
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">🔄 Process Optimization</h4>
              <p className="text-sm text-purple-800">
                Product department shows highest qualification rate (51.1%). 
                Apply similar screening criteria to other departments.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}