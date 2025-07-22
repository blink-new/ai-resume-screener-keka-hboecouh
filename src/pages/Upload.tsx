import { useState, useEffect, useMemo } from 'react'
import { UploadZone } from '@/components/upload/UploadZone'
import { ProcessingQueue } from '@/components/upload/ProcessingQueue'
import { ProcessingJob } from '@/types/resume'
import { JobRequirement } from '@/types/job'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CheckCircle, Clock, AlertTriangle, Briefcase, Target, Upload, FileText, Plus, Trash2 } from 'lucide-react'
import { blink } from '@/blink/client'

interface IntakeDocument {
  id: string
  jobTitle: string
  department: string
  content: string
  fileName: string
  createdAt: string
  isActive: boolean
}

export function Upload() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([])
  const [selectedJobId, setSelectedJobId] = useState<string>('')
  const [jobs, setJobs] = useState<JobRequirement[]>([])
  const [intakeDocuments, setIntakeDocuments] = useState<IntakeDocument[]>([])
  const [showIntakeDialog, setShowIntakeDialog] = useState(false)
  const [newIntake, setNewIntake] = useState({
    jobTitle: '',
    department: '',
    content: '',
    file: null as File | null
  })

  // Mock jobs data
  const mockJobs = useMemo(() => [
    {
      id: 'job-1',
      title: 'Senior Frontend Developer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      experienceLevel: 'senior' as const,
      requiredSkills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML'],
      preferredSkills: ['Next.js', 'Tailwind CSS', 'GraphQL', 'Node.js'],
      education: ['Bachelor\'s in Computer Science', 'Bachelor\'s in Software Engineering'],
      description: 'We are looking for a Senior Frontend Developer to join our growing engineering team.',
      responsibilities: [
        'Develop and maintain React applications',
        'Collaborate with design and backend teams',
        'Mentor junior developers',
        'Code review and quality assurance'
      ],
      qualifications: [
        '5+ years of frontend development experience',
        'Strong proficiency in React and TypeScript',
        'Experience with modern build tools',
        'Excellent problem-solving skills'
      ],
      intakeDocument: 'Senior Frontend Developer - Job Requirements.pdf',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      userId: 'user-1',
      isActive: true
    },
    {
      id: 'job-2',
      title: 'Product Manager',
      department: 'Product',
      location: 'Remote',
      experienceLevel: 'mid' as const,
      requiredSkills: ['Product Management', 'Analytics', 'User Research', 'Agile'],
      preferredSkills: ['SQL', 'A/B Testing', 'Figma', 'Jira'],
      education: ['Bachelor\'s in Business', 'MBA', 'Bachelor\'s in Engineering'],
      description: 'Join our product team to drive innovation and user experience.',
      responsibilities: [
        'Define product roadmap and strategy',
        'Work with engineering and design teams',
        'Analyze user data and feedback',
        'Manage product launches'
      ],
      qualifications: [
        '3+ years of product management experience',
        'Strong analytical skills',
        'Experience with user research',
        'Excellent communication skills'
      ],
      createdAt: '2024-01-10T14:30:00Z',
      updatedAt: '2024-01-10T14:30:00Z',
      userId: 'user-1',
      isActive: true
    },
    {
      id: 'job-3',
      title: 'Data Scientist',
      department: 'Data',
      location: 'New York, NY',
      experienceLevel: 'mid' as const,
      requiredSkills: ['Python', 'Machine Learning', 'SQL', 'Statistics'],
      preferredSkills: ['TensorFlow', 'PyTorch', 'R', 'Tableau', 'AWS'],
      education: ['Master\'s in Data Science', 'PhD in Statistics', 'Master\'s in Computer Science'],
      description: 'Looking for a Data Scientist to help us make data-driven decisions.',
      responsibilities: [
        'Build and deploy ML models',
        'Analyze large datasets',
        'Create data visualizations',
        'Collaborate with product teams'
      ],
      qualifications: [
        '3+ years of data science experience',
        'Strong programming skills in Python',
        'Experience with ML frameworks',
        'Statistical analysis expertise'
      ],
      intakeDocument: 'Data Scientist - Technical Requirements.pdf',
      createdAt: '2024-01-08T09:15:00Z',
      updatedAt: '2024-01-08T09:15:00Z',
      userId: 'user-1',
      isActive: true
    }
  ], [])

  const loadIntakeDocuments = async () => {
    try {
      const docs = await blink.db.intakeDocuments.list({
        orderBy: { createdAt: 'desc' }
      })
      
      const formattedDocs: IntakeDocument[] = docs.map(doc => ({
        id: doc.id,
        jobTitle: doc.jobTitle,
        department: doc.department,
        content: doc.content,
        fileName: doc.fileName,
        createdAt: doc.createdAt,
        isActive: Number(doc.isActive) > 0
      }))
      
      setIntakeDocuments(formattedDocs)
    } catch (error) {
      console.error('Failed to load intake documents:', error)
    }
  }

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        const result = e.target?.result as string
        resolve(result)
      }
      
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsText(file)
    })
  }

  const saveIntakeDocument = async () => {
    if (!newIntake.jobTitle.trim()) {
      alert('Please enter a job title')
      return
    }

    if (!newIntake.content.trim() && !newIntake.file) {
      alert('Please provide job description or upload a file')
      return
    }

    try {
      let content = newIntake.content

      // If file is uploaded, read its content
      if (newIntake.file) {
        content = await readFileContent(newIntake.file)
      }

      // Save to database
      await blink.db.intakeDocuments.create({
        id: `intake_${Date.now()}`,
        jobTitle: newIntake.jobTitle.trim(),
        department: newIntake.department.trim() || 'General',
        content,
        fileName: newIntake.file?.name || 'Manual Entry',
        createdAt: new Date().toISOString(),
        isActive: 1,
        userId: 'user-1' // In real app, get from auth
      })

      // Reload documents
      await loadIntakeDocuments()

      // Reset form
      setNewIntake({
        jobTitle: '',
        department: '',
        content: '',
        file: null
      })
      setShowIntakeDialog(false)

      alert('Intake document saved successfully!')
    } catch (error) {
      console.error('Failed to save intake document:', error)
      alert('Failed to save intake document')
    }
  }

  const deleteIntakeDocument = async (id: string) => {
    if (confirm('Are you sure you want to delete this intake document?')) {
      try {
        await blink.db.intakeDocuments.delete(id)
        await loadIntakeDocuments()
      } catch (error) {
        console.error('Failed to delete intake document:', error)
        alert('Failed to delete intake document')
      }
    }
  }

  const toggleIntakeDocument = async (id: string) => {
    try {
      const doc = intakeDocuments.find(d => d.id === id)
      if (doc) {
        await blink.db.intakeDocuments.update(id, {
          isActive: doc.isActive ? 0 : 1
        })
        await loadIntakeDocuments()
      }
    } catch (error) {
      console.error('Failed to update intake document:', error)
      alert('Failed to update intake document')
    }
  }

  useEffect(() => {
    setJobs(mockJobs)
    loadIntakeDocuments()
  }, [mockJobs])

  const selectedJob = jobs.find(job => job.id === selectedJobId)

  const handleFilesSelected = async (files: File[]) => {
    setIsProcessing(true)
    
    // Create processing jobs
    const jobs: ProcessingJob[] = files.map((file, index) => ({
      id: `job-${Date.now()}-${index}`,
      fileName: file.name,
      status: 'queued',
      progress: 0,
      uploadedAt: new Date().toISOString()
    }))
    
    setProcessingJobs(jobs)
    
    // Simulate processing
    for (let i = 0; i < jobs.length; i++) {
      const job = jobs[i]
      
      // Start processing
      setProcessingJobs(prev => prev.map(j => 
        j.id === job.id ? { ...j, status: 'processing' } : j
      ))
      
      // Simulate progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200))
        setProcessingJobs(prev => prev.map(j => 
          j.id === job.id ? { ...j, progress } : j
        ))
      }
      
      // Complete processing
      setProcessingJobs(prev => prev.map(j => 
        j.id === job.id ? { ...j, status: 'completed', progress: 100 } : j
      ))
    }
    
    setIsProcessing(false)
  }

  const completedJobs = processingJobs.filter(job => job.status === 'completed').length
  const failedJobs = processingJobs.filter(job => job.status === 'failed').length
  const processingJobsCount = processingJobs.filter(job => job.status === 'processing').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Upload Resumes</h1>
        <p className="text-gray-600 mt-2">
          Bulk upload and AI-powered screening of candidate resumes with job-specific targeting
        </p>
      </div>

      {/* Intake Documents Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="w-5 h-5 mr-2 text-green-600" />
              Intake Documents
            </div>
            <Dialog open={showIntakeDialog} onOpenChange={setShowIntakeDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Intake Document
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload Intake Document</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="job-title">Job Title *</Label>
                      <Input
                        id="job-title"
                        value={newIntake.jobTitle}
                        onChange={(e) => setNewIntake(prev => ({ ...prev, jobTitle: e.target.value }))}
                        placeholder="e.g., Senior Frontend Developer"
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={newIntake.department}
                        onChange={(e) => setNewIntake(prev => ({ ...prev, department: e.target.value }))}
                        placeholder="e.g., Engineering"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="file-upload">Upload Document</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      onChange={(e) => setNewIntake(prev => ({ ...prev, file: e.target.files?.[0] || null }))}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Supported formats: PDF, DOC, DOCX, TXT (Max 10MB)
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="job-description">Or paste job description</Label>
                    <Textarea
                      id="job-description"
                      value={newIntake.content}
                      onChange={(e) => setNewIntake(prev => ({ ...prev, content: e.target.value }))}
                      placeholder="Paste job description, requirements, or key skills here..."
                      rows={6}
                    />
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      💡 <strong>Pro Tip:</strong> The more detailed your intake document, the better the AI can match candidates. 
                      Include specific skills, experience requirements, and job responsibilities.
                    </p>
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowIntakeDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={saveIntakeDocument}>
                      Save Intake Document
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {intakeDocuments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No intake documents yet</p>
              <p className="text-sm">Upload job descriptions to improve AI screening accuracy</p>
            </div>
          ) : (
            <div className="space-y-3">
              {intakeDocuments.map((doc) => (
                <div key={doc.id} className={`border rounded-lg p-4 ${doc.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-medium text-gray-900">{doc.jobTitle}</h4>
                        <Badge variant={doc.isActive ? "default" : "secondary"}>
                          {doc.department}
                        </Badge>
                        {doc.isActive && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Active
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        File: {doc.fileName} • Created: {new Date(doc.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {doc.content.substring(0, 150)}...
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant={doc.isActive ? "outline" : "default"}
                        onClick={() => toggleIntakeDocument(doc.id)}
                      >
                        {doc.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteIntakeDocument(doc.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Target Job Position
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="job-select">Select Job Position (Optional)</Label>
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a job position for targeted screening..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="general">General Screening (No specific job)</SelectItem>
                {jobs.filter(job => job.isActive).map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{job.title}</span>
                      <Badge variant="outline" className="ml-2">
                        {job.department}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedJob && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 mb-2">
                    Screening for: {selectedJob.title}
                  </h4>
                  <div className="space-y-2 text-sm text-blue-800">
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-2" />
                      <span>{selectedJob.department} • {selectedJob.location}</span>
                    </div>
                    <div>
                      <span className="font-medium">Required Skills: </span>
                      {selectedJob.requiredSkills.slice(0, 5).join(', ')}
                      {selectedJob.requiredSkills.length > 5 && ` +${selectedJob.requiredSkills.length - 5} more`}
                    </div>
                    <div>
                      <span className="font-medium">Experience Level: </span>
                      <Badge variant="secondary" className="ml-1">
                        {selectedJob.experienceLevel}
                      </Badge>
                    </div>
                    {selectedJob.intakeDocument && (
                      <div className="flex items-center text-green-700">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        <span>Intake document available for enhanced screening</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {(!selectedJobId || selectedJobId === 'general') && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">💡 Pro Tip:</p>
                <p>
                  Select a specific job position to get more accurate screening results. 
                  The AI will match candidates against the job requirements and intake documents 
                  for better relevance scoring.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Processing Stats */}
      {processingJobs.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{completedJobs}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Processing</p>
                <p className="text-2xl font-bold text-blue-600">{processingJobsCount}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedJobs}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upload Zone */}
      <UploadZone 
        onFilesSelected={handleFilesSelected}
        isProcessing={isProcessing}
      />

      {/* Processing Queue */}
      <ProcessingQueue jobs={processingJobs} />

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Upload Files</h3>
              <p className="text-sm text-gray-600">
                Drag and drop or select PDF, DOC, or DOCX resume files. Supports bulk upload of 1000+ files.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">AI Processing</h3>
              <p className="text-sm text-gray-600">
                Our AI extracts candidate information, skills, experience, and generates relevance scores and tags.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Export to Keka</h3>
              <p className="text-sm text-gray-600">
                Review results, filter candidates, and export qualified candidates directly to your Keka ATS.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}