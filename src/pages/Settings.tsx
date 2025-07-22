import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { 
  Settings as SettingsIcon, 
  Key, 
  Brain, 
  Shield, 
  Bell, 
  Users,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Save,
  TestTube,
  Zap,
  Database,
  Cloud,
  Lock
} from 'lucide-react'

export function Settings() {
  const [kekaSettings, setKekaSettings] = useState({
    apiUrl: 'https://api.keka.com/v1',
    apiKey: '',
    organizationId: '',
    isConnected: false,
    lastSync: '2024-01-20T10:30:00Z'
  })

  const [aiSettings, setAiSettings] = useState({
    model: 'gpt-4',
    scoreThreshold: 70,
    autoTagging: true,
    skillExtraction: true,
    experienceWeighting: 0.3,
    skillsWeighting: 0.4,
    educationWeighting: 0.3,
    customPrompt: ''
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    processingComplete: true,
    highScoreCandidates: true,
    systemAlerts: true,
    weeklyReports: true,
    emailAddress: 'admin@company.com'
  })

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: 30,
    ipWhitelist: '',
    auditLogging: true,
    dataRetention: 90
  })

  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | null>(null)

  const testKekaConnection = async () => {
    setIsTestingConnection(true)
    setConnectionStatus(null)
    
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    if (kekaSettings.apiKey && kekaSettings.organizationId) {
      setConnectionStatus('success')
      setKekaSettings(prev => ({ ...prev, isConnected: true }))
    } else {
      setConnectionStatus('error')
    }
    
    setIsTestingConnection(false)
  }

  const saveSettings = () => {
    // In real app, this would save to backend
    console.log('Saving settings:', {
      keka: kekaSettings,
      ai: aiSettings,
      notifications: notificationSettings,
      security: securitySettings
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure your AI resume screener and integrations
          </p>
        </div>
        
        <Button onClick={saveSettings}>
          <Save className="h-4 w-4 mr-2" />
          Save All Changes
        </Button>
      </div>

      <Tabs defaultValue="keka" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="keka">Keka Integration</TabsTrigger>
          <TabsTrigger value="ai">AI Configuration</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Keka Integration */}
        <TabsContent value="keka" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-blue-600" />
                Keka API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    kekaSettings.isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`} />
                  <span className="font-medium">
                    Connection Status: {kekaSettings.isConnected ? 'Connected' : 'Disconnected'}
                  </span>
                </div>
                {kekaSettings.isConnected && (
                  <Badge variant="outline">
                    Last sync: {new Date(kekaSettings.lastSync).toLocaleString()}
                  </Badge>
                )}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="apiUrl">API URL</Label>
                  <Input
                    id="apiUrl"
                    value={kekaSettings.apiUrl}
                    onChange={(e) => setKekaSettings(prev => ({ ...prev, apiUrl: e.target.value }))}
                    placeholder="https://api.keka.com/v1"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="organizationId">Organization ID</Label>
                  <Input
                    id="organizationId"
                    value={kekaSettings.organizationId}
                    onChange={(e) => setKekaSettings(prev => ({ ...prev, organizationId: e.target.value }))}
                    placeholder="your-org-id"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={kekaSettings.apiKey}
                  onChange={(e) => setKekaSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                  placeholder="Enter your Keka API key"
                />
                <p className="text-sm text-gray-500">
                  Your API key is encrypted and stored securely. Get your API key from Keka Admin Panel → Integrations.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button 
                  onClick={testKekaConnection}
                  disabled={isTestingConnection}
                  variant="outline"
                >
                  {isTestingConnection ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  Test Connection
                </Button>
                
                {connectionStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Connection successful!</span>
                  </div>
                )}
                
                {connectionStatus === 'error' && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm">Connection failed. Check your credentials.</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="autoExport">Auto Export Threshold</Label>
                  <Select defaultValue="85">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90+ Score (Excellent)</SelectItem>
                      <SelectItem value="85">85+ Score (Very Good)</SelectItem>
                      <SelectItem value="80">80+ Score (Good)</SelectItem>
                      <SelectItem value="75">75+ Score (Fair)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exportFormat">Export Format</Label>
                  <Select defaultValue="json">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="autoExportEnabled" />
                <Label htmlFor="autoExportEnabled">
                  Automatically export qualified candidates to Keka
                </Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Configuration */}
        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                AI Model Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="aiModel">AI Model</Label>
                  <Select value={aiSettings.model} onValueChange={(value) => 
                    setAiSettings(prev => ({ ...prev, model: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gpt-4">GPT-4 (Recommended)</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Faster)</SelectItem>
                      <SelectItem value="claude-3">Claude 3 (Alternative)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="scoreThreshold">Minimum Score Threshold</Label>
                  <Input
                    id="scoreThreshold"
                    type="number"
                    min="0"
                    max="100"
                    value={aiSettings.scoreThreshold}
                    onChange={(e) => setAiSettings(prev => ({ 
                      ...prev, 
                      scoreThreshold: parseInt(e.target.value) 
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="autoTagging"
                    checked={aiSettings.autoTagging}
                    onCheckedChange={(checked) => 
                      setAiSettings(prev => ({ ...prev, autoTagging: checked }))
                    }
                  />
                  <Label htmlFor="autoTagging">Enable automatic tagging</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="skillExtraction"
                    checked={aiSettings.skillExtraction}
                    onCheckedChange={(checked) => 
                      setAiSettings(prev => ({ ...prev, skillExtraction: checked }))
                    }
                  />
                  <Label htmlFor="skillExtraction">Enable skill extraction</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scoring Weights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Experience Weight</Label>
                    <span className="text-sm text-gray-500">{Math.round(aiSettings.experienceWeighting * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={aiSettings.experienceWeighting}
                    onChange={(e) => setAiSettings(prev => ({ 
                      ...prev, 
                      experienceWeighting: parseFloat(e.target.value) 
                    }))}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Skills Weight</Label>
                    <span className="text-sm text-gray-500">{Math.round(aiSettings.skillsWeighting * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={aiSettings.skillsWeighting}
                    onChange={(e) => setAiSettings(prev => ({ 
                      ...prev, 
                      skillsWeighting: parseFloat(e.target.value) 
                    }))}
                    className="w-full"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Education Weight</Label>
                    <span className="text-sm text-gray-500">{Math.round(aiSettings.educationWeighting * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={aiSettings.educationWeighting}
                    onChange={(e) => setAiSettings(prev => ({ 
                      ...prev, 
                      educationWeighting: parseFloat(e.target.value) 
                    }))}
                    className="w-full"
                  />
                </div>
              </div>
              
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                  Total weight should equal 100%. Current: {Math.round((aiSettings.experienceWeighting + aiSettings.skillsWeighting + aiSettings.educationWeighting) * 100)}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Custom AI Prompt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="customPrompt">Additional Instructions for AI</Label>
                <Textarea
                  id="customPrompt"
                  value={aiSettings.customPrompt}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, customPrompt: e.target.value }))}
                  placeholder="Add custom instructions for the AI to consider when scoring resumes..."
                  rows={4}
                />
                <p className="text-sm text-gray-500">
                  Provide additional context or specific requirements for your organization.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-green-600" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="emailAddress">Notification Email</Label>
                <Input
                  id="emailAddress"
                  type="email"
                  value={notificationSettings.emailAddress}
                  onChange={(e) => setNotificationSettings(prev => ({ 
                    ...prev, 
                    emailAddress: e.target.value 
                  }))}
                  placeholder="admin@company.com"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                  <Label htmlFor="emailNotifications">Enable email notifications</Label>
                </div>
                
                <div className="ml-6 space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="processingComplete"
                      checked={notificationSettings.processingComplete}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, processingComplete: checked }))
                      }
                      disabled={!notificationSettings.emailNotifications}
                    />
                    <Label htmlFor="processingComplete">Processing complete notifications</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="highScoreCandidates"
                      checked={notificationSettings.highScoreCandidates}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, highScoreCandidates: checked }))
                      }
                      disabled={!notificationSettings.emailNotifications}
                    />
                    <Label htmlFor="highScoreCandidates">High-score candidate alerts</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="systemAlerts"
                      checked={notificationSettings.systemAlerts}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, systemAlerts: checked }))
                      }
                      disabled={!notificationSettings.emailNotifications}
                    />
                    <Label htmlFor="systemAlerts">System alerts and errors</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="weeklyReports"
                      checked={notificationSettings.weeklyReports}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, weeklyReports: checked }))
                      }
                      disabled={!notificationSettings.emailNotifications}
                    />
                    <Label htmlFor="weeklyReports">Weekly summary reports</Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-red-600" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="5"
                    max="480"
                    value={securitySettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings(prev => ({ 
                      ...prev, 
                      sessionTimeout: parseInt(e.target.value) 
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dataRetention">Data Retention (days)</Label>
                  <Input
                    id="dataRetention"
                    type="number"
                    min="30"
                    max="365"
                    value={securitySettings.dataRetention}
                    onChange={(e) => setSecuritySettings(prev => ({ 
                      ...prev, 
                      dataRetention: parseInt(e.target.value) 
                    }))}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="twoFactorAuth"
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => 
                      setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))
                    }
                  />
                  <Label htmlFor="twoFactorAuth">Enable two-factor authentication</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="auditLogging"
                    checked={securitySettings.auditLogging}
                    onCheckedChange={(checked) => 
                      setSecuritySettings(prev => ({ ...prev, auditLogging: checked }))
                    }
                  />
                  <Label htmlFor="auditLogging">Enable audit logging</Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ipWhitelist">IP Whitelist (optional)</Label>
                <Textarea
                  id="ipWhitelist"
                  value={securitySettings.ipWhitelist}
                  onChange={(e) => setSecuritySettings(prev => ({ ...prev, ipWhitelist: e.target.value }))}
                  placeholder="192.168.1.0/24&#10;10.0.0.0/8"
                  rows={3}
                />
                <p className="text-sm text-gray-500">
                  Enter IP addresses or CIDR blocks, one per line. Leave empty to allow all IPs.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Data Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Cloud className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Data Backup</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Automatic daily backups to secure cloud storage
                  </p>
                  <Button variant="outline" size="sm">
                    Configure Backup
                  </Button>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Lock className="h-5 w-5 text-green-600" />
                    <span className="font-medium">Data Encryption</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    All data encrypted at rest and in transit
                  </p>
                  <Badge variant="outline" className="text-green-600">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2">Danger Zone</h4>
                <p className="text-sm text-red-700 mb-3">
                  Permanently delete all resume data and candidate information. This action cannot be undone.
                </p>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      Delete All Data
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete all resume data,
                        candidate information, and processing history from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                        Yes, delete everything
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}