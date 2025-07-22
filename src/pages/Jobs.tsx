import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Plus, FileText, Edit, Trash2, Upload, Download, Eye, Users } from 'lucide-react'
import { JobRequirement } from '@/types/job'
import { blink } from '@/blink/client'

export function Jobs() {
  const [jobs, setJobs] = useState<JobRequirement[]>([])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<JobRequirement | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [filterLevel, setFilterLevel] = useState('all')

  // Mock data for demonstration
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

  useEffect(() => {
    setJobs(mockJobs)
  }, [mockJobs])

  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           job.department.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesDepartment = filterDepartment === 'all' || job.department === filterDepartment
      const matchesLevel = filterLevel === 'all' || job.experienceLevel === filterLevel
      
      return matchesSearch && matchesDepartment && matchesLevel && job.isActive
    })
  }, [jobs, searchTerm, filterDepartment, filterLevel])

  const departments = useMemo(() => {
    const depts = [...new Set(jobs.map(job => job.department))]
    return depts
  }, [jobs])

  const handleCreateJob = () => {
    setSelectedJob(null)
    setIsCreateDialogOpen(true)
  }

  const handleEditJob = (job: JobRequirement) => {
    setSelectedJob(job)
    setIsCreateDialogOpen(true)
  }

  const handleDeleteJob = async (jobId: string) => {
    // In real app, this would call the API
    setJobs(prev => prev.filter(job => job.id !== jobId))
  }

  const handleUploadIntakeDocument = async (jobId: string, file: File) => {
    // In real app, this would upload to storage and update the job
    console.log('Uploading intake document for job:', jobId, file.name)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Job Requirements</h1>
          <p className="text-gray-600 mt-1">
            Manage job postings and intake documents for targeted resume screening
          </p>
        </div>
        <Button onClick={handleCreateJob} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Create Job
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{jobs.filter(j => j.isActive).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Upload className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">With Intake Docs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {jobs.filter(j => j.intakeDocument).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-bold text-gray-900">{departments.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Eye className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Screening</p>
                <p className="text-2xl font-bold text-gray-900">94%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search jobs by title or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Levels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="entry">Entry Level</SelectItem>
                <SelectItem value="mid">Mid Level</SelectItem>
                <SelectItem value="senior">Senior Level</SelectItem>
                <SelectItem value="lead">Lead Level</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <CardDescription className="mt-1">
                    {job.department} • {job.location}
                  </CardDescription>
                </div>
                <Badge variant={job.experienceLevel === 'senior' || job.experienceLevel === 'lead' ? 'default' : 'secondary'}>
                  {job.experienceLevel}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Required Skills */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-1">
                    {job.requiredSkills.slice(0, 4).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {job.requiredSkills.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.requiredSkills.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Intake Document Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <FileText className="w-4 h-4 mr-1" />
                    <span className={job.intakeDocument ? 'text-green-600' : 'text-gray-500'}>
                      {job.intakeDocument ? 'Intake Doc Available' : 'No Intake Doc'}
                    </span>
                  </div>
                  {job.intakeDocument && (
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditJob(job)}
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteJob(job.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || filterDepartment !== 'all' || filterLevel !== 'all'
                ? 'Try adjusting your filters to see more results.'
                : 'Create your first job posting to start screening resumes.'}
            </p>
            {(!searchTerm && filterDepartment === 'all' && filterLevel === 'all') && (
              <Button onClick={handleCreateJob} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Job
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create/Edit Job Dialog */}
      <JobFormDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        job={selectedJob}
        onSave={(job) => {
          if (selectedJob) {
            setJobs(prev => prev.map(j => j.id === job.id ? job : j))
          } else {
            setJobs(prev => [...prev, { ...job, id: `job-${Date.now()}` }])
          }
          setIsCreateDialogOpen(false)
        }}
      />
    </div>
  )
}

interface JobFormDialogProps {
  isOpen: boolean
  onClose: () => void
  job: JobRequirement | null
  onSave: (job: JobRequirement) => void
}

function JobFormDialog({ isOpen, onClose, job, onSave }: JobFormDialogProps) {
  const [formData, setFormData] = useState<Partial<JobRequirement>>({
    title: '',
    department: '',
    location: '',
    experienceLevel: 'mid',
    requiredSkills: [],
    preferredSkills: [],
    education: [],
    description: '',
    responsibilities: [],
    qualifications: [],
    isActive: true
  })

  const [skillInput, setSkillInput] = useState('')
  const [preferredSkillInput, setPreferredSkillInput] = useState('')
  const [educationInput, setEducationInput] = useState('')
  const [responsibilityInput, setResponsibilityInput] = useState('')
  const [qualificationInput, setQualificationInput] = useState('')

  useEffect(() => {
    if (job) {
      setFormData(job)
    } else {
      setFormData({
        title: '',
        department: '',
        location: '',
        experienceLevel: 'mid',
        requiredSkills: [],
        preferredSkills: [],
        education: [],
        description: '',
        responsibilities: [],
        qualifications: [],
        isActive: true
      })
    }
  }, [job])

  const handleSave = () => {
    const now = new Date().toISOString()
    const jobData: JobRequirement = {
      id: job?.id || `job-${Date.now()}`,
      title: formData.title || '',
      department: formData.department || '',
      location: formData.location || '',
      experienceLevel: formData.experienceLevel || 'mid',
      requiredSkills: formData.requiredSkills || [],
      preferredSkills: formData.preferredSkills || [],
      education: formData.education || [],
      description: formData.description || '',
      responsibilities: formData.responsibilities || [],
      qualifications: formData.qualifications || [],
      intakeDocument: formData.intakeDocument,
      createdAt: job?.createdAt || now,
      updatedAt: now,
      userId: 'user-1',
      isActive: formData.isActive ?? true
    }
    onSave(jobData)
  }

  const addSkill = () => {
    if (skillInput.trim()) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...(prev.requiredSkills || []), skillInput.trim()]
      }))
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: (prev.requiredSkills || []).filter(s => s !== skill)
    }))
  }

  const addPreferredSkill = () => {
    if (preferredSkillInput.trim()) {
      setFormData(prev => ({
        ...prev,
        preferredSkills: [...(prev.preferredSkills || []), preferredSkillInput.trim()]
      }))
      setPreferredSkillInput('')
    }
  }

  const removePreferredSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      preferredSkills: (prev.preferredSkills || []).filter(s => s !== skill)
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{job ? 'Edit Job' : 'Create New Job'}</DialogTitle>
          <DialogDescription>
            Define job requirements and upload intake documents for targeted resume screening.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g. Senior Frontend Developer"
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                  placeholder="e.g. Engineering"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g. San Francisco, CA"
                />
              </div>
              <div>
                <Label htmlFor="level">Experience Level</Label>
                <Select
                  value={formData.experienceLevel}
                  onValueChange={(value: any) => setFormData(prev => ({ ...prev, experienceLevel: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="lead">Lead Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Job Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the role..."
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="requirements" className="space-y-6">
            {/* Required Skills */}
            <div>
              <Label>Required Skills</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="Add a required skill..."
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button type="button" onClick={addSkill}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.requiredSkills?.map((skill) => (
                  <Badge key={skill} variant="default" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                    {skill} ×
                  </Badge>
                ))}
              </div>
            </div>

            {/* Preferred Skills */}
            <div>
              <Label>Preferred Skills</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={preferredSkillInput}
                  onChange={(e) => setPreferredSkillInput(e.target.value)}
                  placeholder="Add a preferred skill..."
                  onKeyPress={(e) => e.key === 'Enter' && addPreferredSkill()}
                />
                <Button type="button" onClick={addPreferredSkill}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.preferredSkills?.map((skill) => (
                  <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removePreferredSkill(skill)}>
                    {skill} ×
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Responsibilities */}
            <div>
              <Label>Key Responsibilities</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={responsibilityInput}
                  onChange={(e) => setResponsibilityInput(e.target.value)}
                  placeholder="Add a responsibility..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && responsibilityInput.trim()) {
                      setFormData(prev => ({
                        ...prev,
                        responsibilities: [...(prev.responsibilities || []), responsibilityInput.trim()]
                      }))
                      setResponsibilityInput('')
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (responsibilityInput.trim()) {
                      setFormData(prev => ({
                        ...prev,
                        responsibilities: [...(prev.responsibilities || []), responsibilityInput.trim()]
                      }))
                      setResponsibilityInput('')
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <ul className="mt-2 space-y-1">
                {formData.responsibilities?.map((resp, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{resp}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          responsibilities: (prev.responsibilities || []).filter((_, i) => i !== index)
                        }))
                      }}
                    >
                      ×
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Qualifications */}
            <div>
              <Label>Qualifications</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={qualificationInput}
                  onChange={(e) => setQualificationInput(e.target.value)}
                  placeholder="Add a qualification..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && qualificationInput.trim()) {
                      setFormData(prev => ({
                        ...prev,
                        qualifications: [...(prev.qualifications || []), qualificationInput.trim()]
                      }))
                      setQualificationInput('')
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (qualificationInput.trim()) {
                      setFormData(prev => ({
                        ...prev,
                        qualifications: [...(prev.qualifications || []), qualificationInput.trim()]
                      }))
                      setQualificationInput('')
                    }
                  }}
                >
                  Add
                </Button>
              </div>
              <ul className="mt-2 space-y-1">
                {formData.qualifications?.map((qual, index) => (
                  <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="text-sm">{qual}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          qualifications: (prev.qualifications || []).filter((_, i) => i !== index)
                        }))
                      }}
                    >
                      ×
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            <div>
              <Label>Intake Document</Label>
              <p className="text-sm text-gray-600 mb-4">
                Upload a detailed job requirements document that will be used by AI to screen resumes more accurately.
              </p>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">Upload Intake Document</p>
                  <p className="text-gray-600">
                    Drag and drop your job requirements document here, or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports PDF, DOC, DOCX files up to 10MB
                  </p>
                </div>
                <Button className="mt-4" variant="outline">
                  Choose File
                </Button>
              </div>

              {formData.intakeDocument && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <FileText className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-sm font-medium text-green-800">
                        {formData.intakeDocument}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, intakeDocument: undefined }))}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">How Intake Documents Improve Screening</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• AI analyzes the document to understand specific role requirements</li>
                <li>• More accurate matching of candidate skills to job needs</li>
                <li>• Better identification of relevant experience and qualifications</li>
                <li>• Improved scoring based on role-specific criteria</li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            {job ? 'Update Job' : 'Create Job'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}