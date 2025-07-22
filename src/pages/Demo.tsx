import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Play, 
  Upload, 
  Users, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Sparkles,
  Download,
  Eye,
  Zap,
  Brain,
  Target,
  TrendingUp
} from 'lucide-react';

export default function Demo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [screenedCandidates, setScreenedCandidates] = useState(0);
  const [selectedCandidates, setSelectedCandidates] = useState<number[]>([]);

  const demoSteps = useMemo(() => [
    {
      title: "Navigate to Keka Job Page",
      description: "Open your Keka ATS and go to any job listing with candidates",
      icon: <Users className="w-6 h-6" />,
      duration: 2000
    },
    {
      title: "Upload Intake Document",
      description: "Upload job requirements document for AI to understand the role",
      icon: <FileText className="w-6 h-6" />,
      duration: 3000
    },
    {
      title: "Bulk Select Candidates",
      description: "Select multiple candidates using checkboxes",
      icon: <Target className="w-6 h-6" />,
      duration: 2500
    },
    {
      title: "AI Screening Begins",
      description: "Extension automatically extracts candidate data and starts AI analysis",
      icon: <Brain className="w-6 h-6" />,
      duration: 4000
    },
    {
      title: "View Results",
      description: "See AI-categorized results: Interview, Review, or Reject",
      icon: <TrendingUp className="w-6 h-6" />,
      duration: 3000
    }
  ], []);

  const mockCandidates = [
    { id: 1, name: "Sarah Chen", email: "sarah.chen@email.com", score: 92, match: 88, status: "interview" },
    { id: 2, name: "Michael Rodriguez", email: "m.rodriguez@email.com", score: 85, match: 82, status: "interview" },
    { id: 3, name: "Emily Johnson", email: "emily.j@email.com", score: 78, match: 75, status: "review" },
    { id: 4, name: "David Kim", email: "david.kim@email.com", score: 71, match: 68, status: "review" },
    { id: 5, name: "Jessica Liu", email: "j.liu@email.com", score: 65, match: 60, status: "review" },
    { id: 6, name: "Robert Smith", email: "r.smith@email.com", score: 45, match: 42, status: "reject" }
  ];

  useEffect(() => {
    if (isPlaying && currentStep < demoSteps.length) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        if (currentStep === 3) {
          // Simulate screening progress
          let prog = 0;
          const interval = setInterval(() => {
            prog += 10;
            setProgress(prog);
            setScreenedCandidates(Math.floor((prog / 100) * mockCandidates.length));
            if (prog >= 100) clearInterval(interval);
          }, 200);
        }
      }, demoSteps[currentStep].duration);
      return () => clearTimeout(timer);
    } else if (currentStep >= demoSteps.length) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, demoSteps, mockCandidates.length]);

  const startDemo = () => {
    setCurrentStep(0);
    setIsPlaying(true);
    setProgress(0);
    setScreenedCandidates(0);
    setSelectedCandidates([]);
  };

  const resetDemo = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setProgress(0);
    setScreenedCandidates(0);
    setSelectedCandidates([]);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4">AI Resume Screener Demo</h1>
        <p className="text-xl text-muted-foreground mb-6">
          See how our Chrome extension revolutionizes resume screening in Keka ATS
        </p>
        <div className="flex gap-4 justify-center">
          <Button size="lg" onClick={startDemo} disabled={isPlaying}>
            <Play className="mr-2 h-5 w-5" />
            {isPlaying ? 'Demo Running...' : 'Start Interactive Demo'}
          </Button>
          <Button size="lg" variant="outline" onClick={resetDemo}>
            Reset Demo
          </Button>
        </div>
      </div>

      {/* Demo Progress */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Demo Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {demoSteps.map((step, index) => (
              <div key={index} className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                index === currentStep ? 'bg-primary/10 border-2 border-primary' : 
                index < currentStep ? 'bg-muted' : 'opacity-50'
              }`}>
                <div className={`p-2 rounded-full ${
                  index <= currentStep ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {step.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>
                </div>
                {index < currentStep && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                {index === currentStep && <Clock className="w-5 h-5 text-primary animate-pulse" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Simulation */}
      {currentStep >= 3 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Screening in Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Screening Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {screenedCandidates} of {mockCandidates.length} candidates
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
              </div>
              
              {progress === 100 && (
                <Alert className="border-green-500 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Screening complete! AI has categorized all candidates based on job requirements.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Display */}
      {currentStep >= 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Screening Results</CardTitle>
            <CardDescription>
              AI-powered analysis based on job requirements and intake documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="interview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="interview">
                  Interview ({mockCandidates.filter(c => c.status === 'interview').length})
                </TabsTrigger>
                <TabsTrigger value="review">
                  Review ({mockCandidates.filter(c => c.status === 'review').length})
                </TabsTrigger>
                <TabsTrigger value="reject">
                  Reject ({mockCandidates.filter(c => c.status === 'reject').length})
                </TabsTrigger>
              </TabsList>
              
              {['interview', 'review', 'reject'].map(status => (
                <TabsContent key={status} value={status} className="space-y-4">
                  {mockCandidates
                    .filter(c => c.status === status)
                    .map(candidate => (
                      <Card key={candidate.id}>
                        <CardContent className="flex items-center justify-between p-4">
                          <div>
                            <h4 className="font-semibold">{candidate.name}</h4>
                            <p className="text-sm text-muted-foreground">{candidate.email}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="text-sm font-medium">Overall Score</div>
                              <div className="text-2xl font-bold text-primary">{candidate.score}%</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">Job Match</div>
                              <div className="text-2xl font-bold text-green-600">{candidate.match}%</div>
                            </div>
                            <Badge variant={
                              status === 'interview' ? 'default' : 
                              status === 'review' ? 'secondary' : 
                              'destructive'
                            }>
                              {status.toUpperCase()}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </TabsContent>
              ))}
            </Tabs>
            
            <div className="flex gap-4 mt-6">
              <Button className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Export to CSV
              </Button>
              <Button className="flex-1" variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                View Detailed Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card>
          <CardHeader>
            <Zap className="w-8 h-8 text-primary mb-2" />
            <CardTitle>Lightning Fast</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Screen 1000+ resumes in seconds with AI-powered analysis
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Brain className="w-8 h-8 text-primary mb-2" />
            <CardTitle>Smart Matching</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              AI understands job requirements and matches candidates intelligently
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Target className="w-8 h-8 text-primary mb-2" />
            <CardTitle>Zero Manual Work</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              No CV uploads needed - works directly within Keka interface
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}