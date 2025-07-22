import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Progress } from '../components/ui/progress'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Alert, AlertDescription } from '../components/ui/alert'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Target, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Brain,
  Zap,
  Shield
} from 'lucide-react'
import { AIResumeAgent } from '../services/AIResumeAgent'
import { WorkflowAutomation } from '../services/WorkflowAutomation'
import type { PerformanceMetrics, BiasReport } from '../types/resume'

export default function Analytics() {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null)
  const [biasReport, setBiasReport] = useState<BiasReport | null>(null)
  const [automationRules, setAutomationRules] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const aiAgent = new AIResumeAgent()
  const workflowAutomation = new WorkflowAutomation()

  const loadAnalyticsData = async () => {
    try {
      setLoading(true)
      
      const [metrics, bias, rules] = await Promise.all([
        aiAgent.getPerformanceMetrics(),
        aiAgent.getBiasReport(),
        workflowAutomation.getAutomationRules()
      ])
      
      setPerformanceMetrics(metrics)
      setBiasReport(bias)
      setAutomationRules(rules)
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAnalyticsData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toggleAutomationRule = async (ruleId: string, isActive: boolean) => {
    try {
      await workflowAutomation.toggleAutomationRule(ruleId, isActive)
      await loadAnalyticsData()
    } catch (error) {
      console.error('Error toggling automation rule:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Monitor AI performance, bias detection, and automation workflows</p>
        </div>
        <Button onClick={loadAnalyticsData} variant="outline">
          <TrendingUp className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="bias">Bias Detection</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Screened</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceMetrics?.totalScreened || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((performanceMetrics?.accuracyRate || 0) * 100)}%
                </div>
                <Progress value={(performanceMetrics?.accuracyRate || 0) * 100} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hiring Success</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.round((performanceMetrics?.hiringSuccessRate || 0) * 100)}%
                </div>
                <p className="text-xs text-muted-foreground">
                  +5% improvement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Processing</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceMetrics?.avgProcessingTime || 0}s
                </div>
                <p className="text-xs text-muted-foreground">
                  Per candidate
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
              <CardDescription>AI screening performance over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Screening Accuracy</span>
                  <span className="text-sm text-gray-600">93%</span>
                </div>
                <Progress value={93} />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Job Match Precision</span>
                  <span className="text-sm text-gray-600">87%</span>
                </div>
                <Progress value={87} />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">False Positive Rate</span>
                  <span className="text-sm text-gray-600">8%</span>
                </div>
                <Progress value={8} className="[&>div]:bg-red-500" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bias" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Bias Detection Overview
                </CardTitle>
                <CardDescription>AI fairness and bias monitoring</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Bias Score</span>
                  <Badge variant={biasReport && biasReport.overallBiasScore < 0.2 ? "default" : "destructive"}>
                    {Math.round((biasReport?.overallBiasScore || 0) * 100)}%
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Gender Bias</span>
                    <span className="text-sm">{Math.round((biasReport?.genderBias || 0) * 100)}%</span>
                  </div>
                  <Progress value={(biasReport?.genderBias || 0) * 100} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Age Bias</span>
                    <span className="text-sm">{Math.round((biasReport?.ageBias || 0) * 100)}%</span>
                  </div>
                  <Progress value={(biasReport?.ageBias || 0) * 100} />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Education Bias</span>
                    <span className="text-sm">{Math.round((biasReport?.educationBias || 0) * 100)}%</span>
                  </div>
                  <Progress value={(biasReport?.educationBias || 0) * 100} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bias Mitigation Recommendations</CardTitle>
                <CardDescription>AI-generated suggestions to reduce bias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {biasReport?.recommendations.map((recommendation, index) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>{recommendation}</AlertDescription>
                    </Alert>
                  ))}
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      {biasReport?.flaggedDecisions || 0} decisions flagged for review
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Automation Rules
              </CardTitle>
              <CardDescription>Manage workflow automation rules</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{rule.name}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Trigger: {rule.trigger} • {rule.conditions.length} conditions • {rule.actions.length} actions
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleAutomationRule(rule.id, !rule.isActive)}
                      >
                        {rule.isActive ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Auto-Interviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">24</div>
                <p className="text-sm text-gray-600">Scheduled this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Auto-Rejections</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">156</div>
                <p className="text-sm text-gray-600">Processed this week</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Manual Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">43</div>
                <p className="text-sm text-gray-600">Pending review</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Learning Insights
              </CardTitle>
              <CardDescription>How the AI is improving over time</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Top Predictive Factors</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Technical Skills Match</span>
                      <span className="text-sm font-medium">87%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Experience Level</span>
                      <span className="text-sm font-medium">76%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Education Background</span>
                      <span className="text-sm font-medium">64%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Previous Company Size</span>
                      <span className="text-sm font-medium">52%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Learning Progress</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Model Accuracy</span>
                        <span className="text-sm">93%</span>
                      </div>
                      <Progress value={93} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Prediction Confidence</span>
                        <span className="text-sm">89%</span>
                      </div>
                      <Progress value={89} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">Learning Rate</span>
                        <span className="text-sm">+12%</span>
                      </div>
                      <Progress value={78} />
                    </div>
                  </div>
                </div>
              </div>

              <Alert>
                <Brain className="h-4 w-4" />
                <AlertDescription>
                  The AI has processed 2,847 candidates and is continuously learning from hiring outcomes. 
                  Current model shows 93% accuracy in predicting successful hires.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}